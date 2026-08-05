"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  BriefcaseIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  StarIcon,
  TargetIcon,
} from "@/components/flow/icons";
import { ThemeProvider, useTheme } from "@/components/flow/theme/ThemeProvider";

type Tab = "home" | "explore" | "play" | "community" | "profile";
type HeroSlide = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  action: string;
  href: string;
  progressLabel: string;
  progress: number;
};
type Card = {
  title: string;
  description: string;
  tags: string[];
  image: string;
  href?: string;
  action?: "Explore" | "Play";
  badge?: string;
  badgeTone?: "match" | "bonus" | "mystery" | "progress";
  duration?: string;
};

const heroSlides: HeroSlide[] = [
  {
    title: "Step into the Product Manager simulation",
    description: "Your team has a launch problem. Make the next decision and see how the product performs.",
    image: "/images/home/product-manager-hero-v2.webp",
    imageAlt: "A product manager standing on a campus at sunset",
    action: "Resume Story",
    href: "/flow",
    progressLabel: "Scene 1 of 8",
    progress: 13,
  },
  {
    title: "Discover how UX researchers find the real problem",
    description: "Turn an unclear product question into evidence your team can use.",
    image: "/images/home/ux-researcher.webp",
    imageAlt: "A UX researcher reviewing evidence at a workstation",
    action: "Play Simulation",
    href: "/flow",
    progressLabel: "New story",
    progress: 0,
  },
  {
    title: "Could you plan a mission to Mars?",
    description: "Make the calls that keep a crew, a rover and a once-in-a-generation mission moving.",
    image: "/images/home/mars-mission.webp",
    imageAlt: "An aerospace mission planner looking out over Mars",
    action: "Start Challenge",
    href: "/flow",
    progressLabel: "40 XP available",
    progress: 0,
  },
];

const journeys: Card[] = [
  { title: "Product Manager", description: "Explore this career path", tags: ["Technology", "Product", "Strategy"], image: "/images/home/product-manager-hero.webp", href: "/flow", action: "Explore", badge: "TOP MATCH", badgeTone: "match", duration: "7 of 10 items · 5 min" },
  { title: "Marketing Basics", description: "Explore this career path", tags: ["Marketing", "Glossary", "Quiz"], image: "/images/home/marketing-basics.webp", href: "#daily-challenge", action: "Explore", badge: "CONTINUE", badgeTone: "progress", duration: "4 of 10 items · 5 min" },
];

const recommended: Card[] = [
  { title: "UX Researcher", description: "Connects with your interest in understanding people", tags: ["Design", "Research", "Empathy"], image: "/images/home/ux-researcher.webp", href: "/flow", action: "Play", badge: "TOP MATCH", badgeTone: "match", duration: "25 min" },
  { title: "Product Designer", description: "Uses skills from your recent simulation", tags: ["Design", "Figma", "Strategy"], image: "/images/home/product-designer.webp", href: "/flow", action: "Play", badge: "TOP MATCH", badgeTone: "match", duration: "20 min" },
  { title: "Market Analyst", description: "Similar research skills, different kind of work", tags: ["Business", "Analytics", "Trends"], image: "/images/home/market-analyst.webp", href: "/flow", action: "Play", badge: "+ BONUS MATCH", badgeTone: "bonus", duration: "15 min" },
];

const popular: Card[] = [
  { title: "Biomedical Engineer", description: "Explore this career path", tags: ["Health", "Engineering"], image: "/images/home/biomedical-engineer.webp", href: "/flow", action: "Explore", badge: "TRENDING", badgeTone: "progress", duration: "20 min" },
  { title: "Trial Attorney", description: "Explore this career path", tags: ["Law", "Advocacy"], image: "/images/home/trial-attorney.webp", href: "/flow", action: "Explore", badge: "TRENDING", badgeTone: "progress", duration: "18 min" },
  { title: "Cybersecurity Specialist", description: "Explore this career path", tags: ["Security", "Technology"], image: "/images/home/cybersecurity-specialist.webp", href: "/flow", action: "Explore", badge: "TRENDING", badgeTone: "progress", duration: "22 min" },
  { title: "Artisanal Baker", description: "Explore this career path", tags: ["Craft", "Business"], image: "/images/home/artisanal-baker.webp", href: "/flow", action: "Explore", badge: "TRENDING", badgeTone: "progress", duration: "16 min" },
];

const mysteries: Card[] = [
  { title: "Sustainability Advisor", description: "A surprising way to combine science and strategy", tags: ["Science", "Strategy"], image: "/images/home/sustainability-advisor.webp", href: "/flow", action: "Explore", badge: "MYSTERY UNLOCK", badgeTone: "mystery", duration: "New" },
  { title: "Urban Planner", description: "An unexpected place to use systems thinking", tags: ["Cities", "Systems"], image: "/images/home/urban-planner.webp", href: "/flow", action: "Explore", badge: "MYSTERY UNLOCK", badgeTone: "mystery", duration: "New" },
  { title: "Supply Chain Analyst", description: "A surprising way to combine data and logistics", tags: ["Data", "Logistics"], image: "/images/home/supply-chain-analyst.webp", href: "/flow", action: "Explore", badge: "MYSTERY UNLOCK", badgeTone: "mystery", duration: "New" },
];

const tabItems: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "explore", label: "Explore", icon: <CompassIcon /> },
  { id: "play", label: "Play", icon: <TargetIcon /> },
  { id: "community", label: "Community", icon: <StarIcon /> },
  { id: "profile", label: "Profile", icon: <BriefcaseIcon /> },
];

function Brand() {
  return (
    <Link href="/" aria-label="Dreamari landing page" className="rounded-lg font-display text-lg font-extrabold tracking-[-0.04em] text-[var(--component-home-shell-text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-action-secondary)] sm:text-xl">
      DREAMARI
    </Link>
  );
}

function TabButton({ id, active, onSelect, desktop = false }: { id: Tab; active: boolean; onSelect: (tab: Tab) => void; desktop?: boolean }) {
  const item = tabItems.find((tab) => tab.id === id)!;
  if (desktop) {
    return (
      <button type="button" onClick={() => onSelect(id)} aria-current={active ? "page" : undefined} className={`min-h-10 rounded-full px-5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)] ${active ? "bg-[var(--component-home-navigation-active-background)] text-[var(--component-home-navigation-active-text)]" : "text-[var(--component-home-navigation-text)] hover:bg-[var(--component-home-navigation-hover-background)] hover:text-[var(--component-home-shell-text)]"}`}>
        {item.label}
      </button>
    );
  }
  return (
    <button type="button" onClick={() => onSelect(id)} aria-current={active ? "page" : undefined} className={`flex min-h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-action-secondary)] ${active ? "text-[var(--color-action-primary)]" : "text-[var(--component-home-navigation-text)]"}`}>
      <span className="size-5">{item.icon}</span><span>{item.label}</span>
    </button>
  );
}

function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
      <h2 className="text-balance font-display text-xl leading-tight font-extrabold tracking-[-0.035em] text-[var(--component-home-shell-text)] sm:text-2xl">{children}</h2>
      {action}
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return <div className="mt-2 flex min-w-0 items-center gap-2 overflow-hidden text-[10px] font-medium text-[var(--component-home-card-metadata)] sm:text-[11px]">{tags.map((tag, index) => <span key={tag} className="flex min-w-0 shrink items-center gap-2 whitespace-nowrap"><span className="truncate">{tag}</span>{index < tags.length - 1 && <span aria-hidden="true" className="size-0.5 shrink-0 rounded-full bg-[var(--component-home-card-metadata)]" />}</span>)}</div>;
}

const badgeToneClasses: Record<NonNullable<Card["badgeTone"]>, string> = {
  match: "bg-[var(--color-feedback-success)] text-[var(--component-home-quick-action-text)]",
  bonus: "bg-[var(--color-action-primary)] text-[var(--component-home-quick-action-text)]",
  mystery: "bg-[var(--color-category-earning-potential)] text-[var(--component-home-quick-action-text)]",
  progress: "bg-[var(--color-category-workstyle)] text-[var(--color-text-on-warning)]",
};

function CareerCard({ card, size = "standard" }: { card: Card; size?: "wide" | "standard" | "compact" }) {
  const cardWidth = size === "wide" ? "w-[86vw] max-w-[640px] sm:w-[min(640px,78vw)]" : size === "compact" ? "w-[82vw] max-w-[340px] sm:w-[340px]" : "w-[82vw] max-w-[427px] sm:w-[427px]";
  const imageHeight = size === "compact" ? "h-[145px] sm:h-[160px]" : "h-[145px] sm:h-[180px]";
  return (
    <article data-career-card className={`group/card relative shrink-0 snap-start overflow-hidden rounded-[var(--component-home-card-radius)] border border-[var(--component-home-card-border)] bg-[var(--component-home-card-background)] shadow-[0_16px_40px_var(--component-home-card-shadow-color)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] first:origin-left last:origin-right hover:z-20 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_26px_70px_var(--component-home-card-shadow-color)] focus-within:z-20 focus-within:-translate-y-1 focus-within:scale-[1.02] ${cardWidth}`}>
      <div className={`relative overflow-hidden ${imageHeight}`}>
        <Image src={card.image} alt="" fill sizes={size === "wide" ? "(max-width: 640px) 86vw, 640px" : size === "compact" ? "(max-width: 640px) 82vw, 340px" : "(max-width: 640px) 82vw, 427px"} className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover/card:scale-[1.045] group-focus-within/card:scale-[1.045]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--component-home-hero-overlay)]/5 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--component-home-card-background)] via-[var(--component-home-card-background)]/65 to-transparent" />
        {card.badge && <span className={`absolute top-3 left-3 inline-flex h-[18px] items-center rounded-full px-4 text-[7px] leading-none font-extrabold tracking-[0.08em] ${badgeToneClasses[card.badgeTone ?? "match"]}`}>{card.badge}</span>}
        {card.duration && <span className="absolute bottom-3 left-4 rounded-full bg-[var(--component-home-card-media-label-background)]/55 px-2 py-1 text-[11px] font-semibold text-[var(--component-home-card-media-metadata)] backdrop-blur-sm">{card.duration}</span>}
      </div>
      <div className="flex min-h-[156px] flex-col px-4 pt-4 pb-[10px]">
        <h3 className="truncate text-[17px] leading-5 font-bold tracking-[-0.018em] text-[var(--component-home-card-text)]">{card.title}</h3>
        <p className="mt-2 truncate text-[11px] leading-5 font-medium text-[var(--component-home-card-description)] sm:text-xs">{card.description}</p>
        <TagList tags={card.tags} />
        {card.action && <Link href={card.href ?? "/flow"} className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-[var(--component-home-card-radius)] bg-[var(--color-action-primary)] px-4 py-2 text-xs font-extrabold text-[var(--component-home-navigation-active-text)] transition-[background-color,transform] duration-300 hover:bg-[var(--color-action-primary-hover)] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)]">{card.action}</Link>}
      </div>
    </article>
  );
}

function ImageRail({ cards, size = "standard", label }: { cards: Card[]; size?: "wide" | "standard" | "compact"; label: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanGoBack(rail.scrollLeft > 4);
    setCanGoForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    updateControls();
    rail.addEventListener("scroll", updateControls, { passive: true });
    const observer = new ResizeObserver(updateControls);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", updateControls);
      observer.disconnect();
    };
  }, [cards.length, updateControls]);

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    const firstCard = rail?.querySelector<HTMLElement>("[data-career-card]");
    if (!rail || !firstCard) return;
    const cardStep = firstCard.offsetWidth + 16;
    const visibleCards = Math.max(1, Math.floor(rail.clientWidth / cardStep));
    rail.scrollBy({ left: direction * cardStep * visibleCards, behavior: "smooth" });
  }

  return (
    <div className="group/rail relative">
      <div ref={railRef} aria-label={label} className="dreamari-card-rail flex snap-x snap-mandatory gap-4 overflow-x-auto py-4 [scrollbar-width:none]">
        {cards.map((card) => <CareerCard key={card.title} card={card} size={size} />)}
      </div>
      <button type="button" onClick={() => move(-1)} aria-label={`Previous ${label}`} disabled={!canGoBack} className={`absolute top-4 bottom-4 left-0 z-30 hidden w-12 items-center justify-center bg-gradient-to-r from-[var(--component-home-rail-fade)] via-[var(--component-home-rail-fade)]/90 to-transparent text-[var(--component-home-rail-control-text)] transition-opacity sm:flex ${canGoBack ? "opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100" : "pointer-events-none opacity-0"}`}><span className="flex size-10 items-center justify-center rounded-full bg-[var(--component-home-rail-control-background)]/90 shadow-sm backdrop-blur"><ChevronLeftIcon className="size-5" /></span></button>
      <button type="button" onClick={() => move(1)} aria-label={`Next ${label}`} disabled={!canGoForward} className={`absolute top-4 right-0 bottom-4 z-30 hidden w-12 items-center justify-center bg-gradient-to-l from-[var(--component-home-rail-fade)] via-[var(--component-home-rail-fade)]/90 to-transparent text-[var(--component-home-rail-control-text)] transition-opacity sm:flex ${canGoForward ? "opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100" : "pointer-events-none opacity-0"}`}><span className="flex size-10 items-center justify-center rounded-full bg-[var(--component-home-rail-control-background)]/90 shadow-sm backdrop-blur"><ChevronRightIcon className="size-5" /></span></button>
    </div>
  );
}

function QuickAction({ label, accent, onClick, href }: { label: string; accent: string; onClick?: () => void; href?: string }) {
  const className = "home-quick-action group flex min-h-[72px] items-center justify-center rounded-[var(--component-home-quick-action-radius)] border border-[var(--component-home-quick-action-border)]/10 px-4 text-center text-[15px] font-extrabold text-[var(--component-home-quick-action-text)] shadow-[0_12px_30px_var(--component-home-quick-action-shadow-color)] transition-[transform,filter] duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)]";
  const content = <span>{label}</span>;
  const style = { "--home-action-accent": accent } as CSSProperties;
  return href ? <Link href={href} className={className} style={style}>{content}</Link> : <button type="button" onClick={onClick} className={className} style={style}>{content}</button>;
}

function ViewAllAction({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label={`View all ${label}`} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-extrabold text-[var(--component-home-rail-view-all)] transition-colors hover:text-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)]"><span>View all</span><ChevronRightIcon className="size-4" /></button>;
}

function StudentHomeContent() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === "undefined") return "home";
    const tab = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    return tab && tabItems.some((item) => item.id === tab) ? tab : "home";
  });
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [streakAcknowledged, setStreakAcknowledged] = useState(false);
  const [notice, setNotice] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setHeroIndex((current) => (current + 1) % heroSlides.length), 5500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category");
    const target = category ? document.getElementById(category) : null;
    if (target) window.requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }, []);

  const selectTab = useCallback((tab: Tab, category?: string) => {
    setActiveTab(tab);
    const query = new URLSearchParams();
    if (tab !== "home") query.set("tab", tab);
    if (tab === "explore" && category) query.set("category", category);
    window.history.replaceState(null, "", query.size ? `/home?${query}` : "/home");
    if (tab === "home" || tab === "play") document.getElementById("featured")?.scrollIntoView({ behavior: "smooth" });
    if (tab === "explore") document.getElementById(category ?? "recommended")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (tab === "community") {
      document.getElementById("popular")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setNotice("Community recommendations are ready to explore.");
    }
    if (tab === "profile") {
      setNotice("Your profile is represented by your XP, streak and recommendations for this demo.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  function startChallenge() {
    setChallengeComplete(true);
    setNotice("Daily challenge complete — 40 XP added.");
  }

  return (
    <div className="student-home min-h-dvh bg-[var(--component-home-shell-background)] pb-24 text-[var(--component-home-shell-text)] transition-colors duration-300 sm:pb-12">
      <header className="sticky top-0 z-50 border-b border-[var(--component-home-navigation-border)] bg-[var(--component-home-navigation-background)]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:h-18 sm:px-6 lg:px-10">
          <Brand />
          <nav className="hidden items-center gap-2 sm:flex" aria-label="Student home sections">
            <TabButton id="explore" active={activeTab === "explore"} onSelect={selectTab} desktop />
            <TabButton id="play" active={activeTab === "play" || activeTab === "home"} onSelect={selectTab} desktop />
            <TabButton id="community" active={activeTab === "community"} onSelect={selectTab} desktop />
          </nav>
          <div className="flex items-center gap-2.5">
            <span className="hidden rounded-full border border-[var(--component-home-navigation-border)] bg-[var(--component-home-navigation-hover-background)] px-3 py-2 text-xs font-extrabold text-[var(--component-home-shell-text)] xs:inline-flex sm:inline-flex"><StarIcon className="mr-1.5 size-4 text-[var(--component-home-navigation-reward)]" />15,980 XP</span>
            <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"} className="flex size-10 items-center justify-center rounded-full border border-[var(--component-home-navigation-border)] bg-[var(--component-home-navigation-hover-background)] text-[var(--component-home-navigation-text)] transition-colors hover:text-[var(--component-home-shell-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)]"><span className="size-4">{theme === "dark" ? <SunIcon /> : <MoonIcon />}</span></button>
            <button type="button" onClick={() => selectTab("profile")} aria-label="Open profile" className="flex size-10 items-center justify-center rounded-full bg-[var(--component-home-navigation-active-background)] text-sm font-extrabold text-[var(--component-home-navigation-active-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)]">AK</button>
          </div>
        </div>
      </header>

      <main>
        <section id="featured" className="scroll-mt-20">
          <div className="group/hero relative h-[470px] w-full overflow-hidden sm:h-[500px] lg:h-[520px]">
            {heroSlides.map((slide, index) => (
              <div key={slide.title} aria-hidden={heroIndex !== index} className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${heroIndex === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.035] opacity-0"}`}>
                <Image src={slide.image} alt={heroIndex === index ? slide.imageAlt : ""} fill priority={index === 0} sizes="100vw" className="object-cover object-center" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--component-home-hero-overlay)]/88 via-[var(--component-home-hero-overlay)]/42 to-[var(--component-home-hero-overlay)]/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--component-home-hero-overlay)] via-[var(--component-home-hero-overlay)]/35 to-transparent" />
            {heroSlides.map((slide, index) => (
              <div key={`${slide.title}-copy`} aria-hidden={heroIndex !== index} className={`absolute inset-0 flex flex-col justify-end px-4 pt-10 pb-14 text-[var(--component-home-hero-text)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] sm:px-6 sm:pb-16 lg:px-10 ${heroIndex === index ? "translate-y-0 opacity-100 delay-150" : "pointer-events-none translate-y-4 opacity-0"}`}>
                <h1 className="max-w-[1180px] text-balance font-display text-[clamp(2rem,3.15vw,2.8rem)] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-left lg:whitespace-nowrap">{slide.title}</h1>
                <p className="mt-4 max-w-[980px] text-sm leading-6 text-[var(--component-home-hero-description)] sm:whitespace-nowrap sm:text-base sm:leading-7">{slide.description}</p>
                <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:gap-6">
                  <Link tabIndex={heroIndex === index ? 0 : -1} href={slide.href} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--color-action-primary)] px-6 py-3 text-sm font-extrabold text-[var(--component-home-navigation-active-text)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)] sm:w-[247px]">{slide.action}</Link>
                  <div className="w-full sm:w-[430px] sm:pt-1">
                    {slide.progress > 0 && <div className="flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--component-home-hero-text)]/35"><div className="h-full rounded-full bg-[var(--color-action-secondary)] transition-[width] duration-700" style={{ width: `${slide.progress}%` }} /></div><span className="w-8 text-right text-[11px] font-bold text-[var(--component-home-hero-description)]">{slide.progress}%</span></div>}
                    <p className={`${slide.progress > 0 ? "mt-2" : "mt-1"} text-[11px] font-bold text-[var(--component-home-hero-metadata)]`}>{slide.progressLabel}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2" aria-label={`Featured story ${heroIndex + 1} of ${heroSlides.length}`}>
              {heroSlides.map((slide, index) => <button key={slide.title} type="button" onClick={() => setHeroIndex(index)} aria-label={`Show ${slide.title}`} aria-current={heroIndex === index ? "true" : undefined} className={`h-1.5 rounded-full transition-[width,background-color] duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-action-secondary)] ${heroIndex === index ? "w-7 bg-[var(--component-home-hero-text)]" : "w-1.5 bg-[var(--component-home-hero-text)]/45 hover:bg-[var(--component-home-hero-text)]/75"}`} />)}
            </div>
            <button type="button" onClick={() => setHeroIndex((heroIndex - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous featured story" className="absolute top-1/2 left-3 z-30 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--component-home-hero-control-background)]/55 text-[var(--component-home-hero-text)] opacity-0 shadow-[0_12px_30px_var(--component-home-hero-shadow-color)] backdrop-blur transition-opacity group-hover/hero:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--color-action-secondary)] sm:flex"><ChevronLeftIcon className="size-5" /></button>
            <button type="button" onClick={() => setHeroIndex((heroIndex + 1) % heroSlides.length)} aria-label="Next featured story" className="absolute top-1/2 right-3 z-30 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--component-home-hero-control-background)]/55 text-[var(--component-home-hero-text)] opacity-0 shadow-[0_12px_30px_var(--component-home-hero-shadow-color)] backdrop-blur transition-opacity group-hover/hero:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[var(--color-action-secondary)] sm:flex"><ChevronRightIcon className="size-5" /></button>
          </div>
        </section>

        <div className="mx-auto max-w-[1360px] space-y-12 px-4 pt-5 sm:space-y-16 sm:px-6 sm:pt-6 lg:px-10">
          <section>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              <QuickAction label="Continue" accent="var(--color-category-classes)" href="/flow" />
              <QuickAction label={challengeComplete ? "40 XP Earned" : "Daily Challenge"} accent="var(--color-category-earning-potential)" onClick={() => document.getElementById("daily-challenge")?.scrollIntoView({ behavior: "smooth", block: "center" })} />
              <QuickAction label={streakAcknowledged ? "Streak Protected" : "6-Day Streak"} accent="var(--color-category-future-fit)" onClick={() => { setStreakAcknowledged(true); setNotice("Your 6-day streak is protected for today."); }} />
              <QuickAction label="Explore" accent="var(--color-category-skills)" onClick={() => selectTab("explore", "recommended")} />
            </div>
          </section>

          <section id="journey" className="scroll-mt-24">
            <SectionTitle action={<ViewAllAction label="Continue Your Journey" onClick={() => selectTab("explore", "journey")} />}>Continue Your Journey</SectionTitle>
            <ImageRail cards={journeys} size="wide" label="Continue Your Journey" />
          </section>

          <section id="recommended" className="scroll-mt-24">
            <SectionTitle action={<ViewAllAction label="Recommended for You" onClick={() => selectTab("explore", "recommended")} />}>Recommended for You</SectionTitle>
            <ImageRail cards={recommended} label="Recommended for You" />
          </section>

          <section id="daily-challenge" className="scroll-mt-24 overflow-hidden rounded-[var(--dimension-radius-2xl)] border border-[var(--component-home-feature-border)]/35 bg-gradient-to-br from-[var(--component-home-feature-background-start)] to-[var(--component-home-feature-background-end)] p-5 text-[var(--component-home-feature-text)] shadow-[0_22px_64px_var(--component-home-feature-shadow-color)] sm:p-8 lg:p-10">
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.18em] text-[var(--component-home-feature-accent)] uppercase">Daily Challenge</p>
                <h2 className="mt-2 font-display text-2xl leading-tight font-extrabold tracking-[-0.035em] sm:text-4xl">Today&apos;s 3-Word Challenge</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--component-home-feature-description)] sm:text-base">Master these three essential product terms in under 3 minutes and lock in your daily XP bonus.</p>
                <div className="mt-5 flex flex-wrap gap-2">{["Roadmap", "Prototype", "Stakeholder"].map((word) => <span key={word} className="rounded-full border border-[var(--component-home-feature-border)]/35 bg-[var(--component-home-feature-background-end)]/45 px-3 py-2 text-xs font-bold text-[var(--component-home-feature-accent)]">{word}</span>)}</div>
              </div>
              <div className="flex items-center justify-between gap-5 lg:flex-col lg:items-end">
                <p className="text-2xl font-extrabold text-[var(--component-home-feature-reward)]">+40 XP</p>
                <button type="button" onClick={startChallenge} disabled={challengeComplete} className="min-h-12 rounded-xl bg-[var(--color-action-primary)] px-6 py-3 text-sm font-extrabold text-[var(--component-home-navigation-active-text)] transition-[background-color,transform] enabled:hover:-translate-y-0.5 enabled:hover:bg-[var(--color-action-primary-hover)] disabled:cursor-default disabled:bg-[var(--color-feedback-success)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)]">{challengeComplete ? "Challenge complete" : "Start Challenge"}</button>
              </div>
            </div>
          </section>

          <section id="popular" className="scroll-mt-24">
            <SectionTitle action={<ViewAllAction label="Popular with Explorers This Week" onClick={() => selectTab("explore", "popular")} />}>Popular with Explorers This Week</SectionTitle>
            <ImageRail cards={popular} size="compact" label="Popular with Explorers This Week" />
          </section>

          <section id="mystery" className="scroll-mt-24">
            <SectionTitle action={<ViewAllAction label="Mystery Unlocks" onClick={() => selectTab("explore", "mystery")} />}>Mystery Unlocks</SectionTitle>
            <ImageRail cards={mysteries} label="Mystery Unlocks" />
          </section>

          <section>
            <SectionTitle>Because you explored engineering and design…</SectionTitle>
            <div className="relative min-h-80 overflow-hidden rounded-[var(--dimension-radius-2xl)] border border-[var(--component-home-navigation-border)] sm:min-h-96">
              <Image src="/images/home/mars-mission.webp" alt="An aerospace mission planner looking out over Mars" fill sizes="100vw" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--component-home-hero-overlay)] via-[var(--component-home-hero-overlay)]/76 to-transparent" />
              <div className="relative flex min-h-80 max-w-xl flex-col items-start justify-center p-6 text-[var(--component-home-hero-text)] sm:min-h-96 sm:p-10 lg:p-14">
                <span className="rounded-full border border-[var(--component-home-hero-text)]/25 bg-[var(--component-home-hero-control-background)]/30 px-3 py-1.5 text-[9px] font-extrabold tracking-[0.16em] uppercase backdrop-blur">Sponsored</span>
                <h2 className="mt-4 text-balance font-display text-3xl leading-[1.02] font-extrabold tracking-[-0.04em] sm:text-5xl">Could you plan a mission to Mars?</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[var(--component-home-hero-description)]">Make the calls that keep a crew, a rover and a once-in-a-generation mission moving.</p>
                <Link href="/flow" className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[var(--color-action-primary)] px-6 py-3 text-sm font-extrabold text-[var(--component-home-navigation-active-text)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[var(--color-action-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-secondary)]">Start Challenge</Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--component-home-navigation-border)] bg-[var(--component-home-navigation-background)]/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl sm:hidden" aria-label="Student app tabs">
        <div className="mx-auto flex max-w-md items-center justify-around">{tabItems.map((item) => <TabButton key={item.id} id={item.id} active={activeTab === item.id || (item.id === "home" && activeTab === "play")} onSelect={selectTab} />)}</div>
      </nav>

      {notice && <div role="status" className="fixed right-4 bottom-24 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-[var(--component-home-card-border)] bg-[var(--component-home-card-background)] p-4 text-sm font-bold text-[var(--component-home-card-text)] shadow-[0_20px_60px_var(--component-home-card-shadow-color)] sm:bottom-6"><span className="size-5 shrink-0 text-[var(--color-feedback-success)]"><CheckIcon /></span><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message" className="ml-2 rounded-lg px-2 py-1 text-[var(--component-home-card-metadata)] hover:text-[var(--component-home-card-text)]">×</button></div>}
    </div>
  );
}

export function StudentHomeExperience() {
  return <ThemeProvider><StudentHomeContent /></ThemeProvider>;
}
