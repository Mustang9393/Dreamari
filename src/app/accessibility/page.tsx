import type { Metadata } from "next";
import Link from "next/link";
import "@/components/marketing/tokens.css";
import "@/components/app/app.css";

// The accessibility statement (audit 21 Oct 2026). Districts ask every vendor
// for one; it is also the app's one help page, reached from the same place on
// every screen (the menu), which is what WCAG 3.2.6 asks of help. "Words we
// use" is the glossary that WCAG 3.1.3 and 3.1.4 accept for jargon and
// abbreviations. Student-facing copy: 8th grade, short lines.
export const metadata: Metadata = {
  title: "Accessibility · Dreamari",
  description: "How Dreamari works for every student, the settings you can change, and how to tell us about a problem.",
};

// DEMO-ONLY: the report inbox. Swap for the support address before launch.
const REPORT_EMAIL = "ux@dreamopportunity.org";

const TERMS: [string, string][] = [
  ["A&P license", "Airframe and Powerplant license. The license an aircraft mechanic needs."],
  ["ACT", "A college entrance test. Many colleges take it or the SAT."],
  ["AP", "Advanced Placement. College-level classes you take in high school."],
  ["ATS", "Applicant Tracking System. The software employers use to read resumes."],
  ["CISSP", "Certified Information Systems Security Professional. A cybersecurity certificate."],
  ["Dream Score", "Your points in Dreamari. You earn them as you explore and plan."],
  ["FAFSA", "Free Application for Federal Student Aid. The form for college money from the government."],
  ["GPA", "Grade Point Average. Your average grade, usually out of 4.0."],
  ["SAT", "A college entrance test. Many colleges take it or the ACT."],
  ["SQL", "Structured Query Language. A language for working with data."],
  ["STEM", "Science, Technology, Engineering and Math."],
  ["XP", "Experience points. The points you earn in Dreamari."],
];

const CAN_DO: [string, string][] = [
  ["Keyboard", "Every page works with Tab, Enter and the arrow keys. Escape closes a pop-up."],
  ["Screen readers", "Pages have headings and labels. Game results and saved items are read out."],
  ["Videos", "Company videos have captions and a written transcript."],
  ["Zoom", "Pages work at 200% zoom and on small phones."],
  ["Less motion", "If your device asks for less motion, Dreamari stops its animations."],
  ["High contrast", "Dreamari keeps working with Windows high contrast themes."],
  ["Game timers", "You can turn off the timers in career games."],
  ["Tips", "You can hide pop-up tips and welcome screens."],
];

const KEYS: [string, string][] = [
  ["Tab / Shift+Tab", "Move to the next or last control"],
  ["Enter or Space", "Press a button or open a link"],
  ["Arrow keys", "Move between tabs and menu items"],
  ["Escape", "Close a pop-up, menu or tip"],
  ["1 to 9", "Pick an answer in a career game, when the question has focus"],
  ["Ctrl+K or Cmd+K", "Search, in the counselor dashboard"],
];

const card = "flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]";
const cardStyle = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" } as const;
const muted = { color: "var(--muted-foreground)" } as const;

export default function AccessibilityPage() {
  return (
    <main id="main" className="marketing-v2 themeable min-h-dvh px-5 py-[var(--space-10)] sm:px-[var(--space-8)]" style={{ color: "var(--foreground)", background: "var(--background)", fontFamily: "var(--font-body)" }}>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-[var(--space-6)]">
        <Link href="/home" className="dm-link w-fit text-[14px] font-semibold" style={{ color: "var(--accent-subtle)" }}>Back to Dreamari</Link>
        <header className="flex flex-col gap-[var(--space-2)]">
          <h1 className="text-[32px] leading-[1.1] font-extrabold uppercase sm:text-[40px]" style={{ fontFamily: "var(--font-display)" }}>Accessibility</h1>
          <p className="text-[16px] leading-[1.6]" style={muted}>Dreamari is built for every student. We follow WCAG 2.2 Level AA. That is the standard schools use for websites and apps.</p>
        </header>

        <section aria-labelledby="a11y-can" className={card} style={cardStyle}>
          <h2 id="a11y-can" className="text-[20px] font-bold">What works today</h2>
          <ul className="flex flex-col gap-[var(--space-3)]">
            {CAN_DO.map(([title, line]) => (
              <li key={title} className="flex flex-col gap-[2px] text-[15px] leading-[1.6]"><span className="font-bold">{title}</span><span style={muted}>{line}</span></li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="a11y-settings" className={card} style={cardStyle}>
          <h2 id="a11y-settings" className="text-[20px] font-bold">Settings you can change</h2>
          <p className="text-[15px] leading-[1.6]" style={muted}>Turn off game timers and hide tips in <Link href="/profile?tab=settings&section=accessibility" className="dm-link font-semibold underline" style={{ color: "var(--accent-subtle)" }}>Profile, Settings, Accessibility</Link>. Less motion, high contrast and bigger text follow your device settings.</p>
        </section>

        <section aria-labelledby="a11y-keys" className={card} style={cardStyle}>
          <h2 id="a11y-keys" className="text-[20px] font-bold">Keyboard</h2>
          <dl className="grid grid-cols-1 gap-x-[var(--space-5)] gap-y-[var(--space-2)] text-[15px] leading-[1.6] sm:grid-cols-[auto_1fr]">
            {KEYS.map(([key, what]) => (
              <div key={key} className="contents">
                <dt className="font-bold">{key}</dt>
                <dd style={muted}>{what}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="a11y-words" className={card} style={cardStyle}>
          <h2 id="a11y-words" className="text-[20px] font-bold">Words we use</h2>
          <dl className="flex flex-col gap-[var(--space-3)] text-[15px] leading-[1.6]">
            {TERMS.map(([term, meaning]) => (
              <div key={term} className="flex flex-col gap-[2px]">
                <dt className="font-bold">{term}</dt>
                <dd style={muted}>{meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="a11y-report" className={card} style={cardStyle}>
          <h2 id="a11y-report" className="text-[20px] font-bold">Tell us about a problem</h2>
          <p className="text-[15px] leading-[1.6]" style={muted}>If something is hard to use, we want to know. Tell us what page you were on and what happened. We will fix it or help you another way.</p>
          <a href={`mailto:${REPORT_EMAIL}?subject=${encodeURIComponent("Dreamari accessibility")}`} className="dm-solid w-fit rounded-[var(--radius-md)] px-[18px] py-[12px] text-[15px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Email us</a>
          <p className="text-[13px]" style={muted}>Last reviewed October 2026.</p>
        </section>
      </div>
    </main>
  );
}
