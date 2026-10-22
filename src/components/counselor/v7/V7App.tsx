"use client";

// Counselor v7 (20 Oct 2026): Joshua's official counselor direction, built
// from the new Replit (https://dceeai.replit.app/dreamari-counselor-dashboard;
// Slack, 20 Oct: "Please use this as the version to replicate moving
// forward") on the Black & Blue design system, borrowing what already works
// from v4 and v5. Chandu: "build this but with our new design system and
// colors and borrowing UI elements from the other versions."
//
// Home | Students | Explore | Prepare | Opportunities | Analytics, the
// Replit's tabs. Analytics is in the nav but not built (Joshua: "Analytics is
// not done yet, so please do not build that section yet"). Reviews and the
// counselor profile are reached from Home and the badge, not tabs.
//
// Same chrome, backdrop, column and type as the student pages and v5, so it
// reads as the same world. Dark (Black & Blue) by default; see theme.tsx.

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Briefcase, ClipboardList, Compass, House, Send, Users } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, type MobileNavItem, type NavItem } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { NavIconButton } from "@/components/app/Inbox";
import { useUnreadCount } from "./Messages";
import { setCounselorBase } from "@/lib/counselorBase";
import { skyArrival } from "@/lib/sky";
import { useEffect } from "react";
import { CounselorProfileSheet } from "./ProfileSheet";
import { ExploreSheetHost } from "../v5/ExploreSheets";
import { LogSheetHost } from "../v5/LogSheet";
import "../v5/v5.css";
import "../calm.css";
import "./v7.css";
import { V7Home } from "./Home";
import { V7Students } from "./Students";
import { V7Explore } from "./Explore";
import { V7Prepare } from "./Prepare";
import { V7Opportunities } from "./Opportunities";
import { V7Analytics } from "./Analytics";
import { V7Workspace } from "./Workspace";
import { OppSheetHost } from "./OppSheets";
import { V7SchoolSheet } from "./ExploreFactSheets";
import { V7CareerSheet } from "./CareerSheet";
import { v7 } from "./ui";

export const V7_VIEWS = ["home", "students", "explore", "prepare", "opportunities", "analytics"] as const;
export type V7View = (typeof V7_VIEWS)[number];

const LABEL: Record<V7View, string> = { home: "Home", students: "Students", explore: "Explore", prepare: "Prepare", opportunities: "Opportunities", analytics: "Analytics" };
// Built inside the component, after setCounselorBase (22 Oct 2026 bug: as
// module constants they were computed at import, on the default v=5 base,
// so every top link in v7 switched the build to v5).
const navItems = (): NavItem[] => V7_VIEWS.map((v) => ({ label: LABEL[v], href: v7(v) }));
// Five fit a phone's bottom bar with the profile slot; Analytics (not built
// yet) waits in the top bar there.
const mobileNavItems = (): MobileNavItem[] => [
  { label: "Home", href: v7("home"), Icon: House },
  { label: "Students", href: v7("students"), Icon: Users },
  { label: "Explore", href: v7("explore"), Icon: Compass },
  { label: "Prepare", href: v7("prepare"), Icon: ClipboardList },
  { label: "Opportunities", href: v7("opportunities"), Icon: Briefcase },
];

// DEMO-ONLY: the signed-in counselor. Production reads the user record.
const COUNSELOR = { name: "Sarah Chen" };

function CounselorBadge({ size = 32 }: { size?: number }) {
  return <Image src="/images/connect/avatars/pro-tanaka.jpg" alt="" width={64} height={64} aria-hidden className="flex-none rounded-full object-cover" style={{ width: size, height: size, objectPosition: "50% 20%" }} />;
}

export function V7App({ view }: { view: string | undefined }) {
  // shared v5 pieces (sheets, the review desk, the brief) link inside v7
  setCounselorBase("/counselor?v=7");
  const NAV = navItems();
  const MOBILE_NAV = mobileNavItems();
  const params = useSearchParams();
  const router = useRouter();
  // the Replit's nav Messages with its unread badge (22 Oct 2026)
  const unread = useUnreadCount();
  const inbox = <NavIconButton label="Messages" badge={unread} onClick={() => router.push(v7("workspace", "&tab=messages"))}><Send className="h-5 w-5" aria-hidden /></NavIconButton>;
  const studentId = params.get("studentId") ?? undefined;
  const tab = params.get("tab") ?? undefined;
  // every view is a page to the counselor: the sky greets each one (lib/sky.ts)
  useEffect(() => { skyArrival(); }, [view, studentId, tab]);
  const onProfile = view === "profile";
  const onReviews = view === "reviews" || view === "workspace";
  const active: V7View = V7_VIEWS.includes(view as V7View) ? (view as V7View) : onReviews ? "home" : "home";
  // the workspace is not a tab: no tab claims it (it said Home before)
  const navLabel = onProfile ? "Profile" : onReviews ? "" : LABEL[active];
  return (
    <div className="marketing-v2 themeable counselor-calm relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)" }}>
      {/* the app's own sky, aurora and stars moving (22 Oct 2026, Chandu:
         "use the new backgrounds we made for the app with the aurora stuff
         ... these counselor pages too. Use the stars etc."); was the still
         calm sky, kept cheap under the glass blur */}
      <AppBackdrop />
      <DesktopNavigation
        active={navLabel}
        items={NAV}
        right={
          <>
            {inbox}
            <IconTip label={COUNSELOR.name}>
              <Link href={v7("profile")} aria-label={`${COUNSELOR.name}, your profile`} className="dm-quiet flex items-center rounded-full">
                <CounselorBadge />
              </Link>
            </IconTip>
          </>
        }
      />
      <MobileHeaderShell>
        <Wordmark href={v7("home")} />
        <div className="flex items-center gap-[var(--space-2)]">
          {inbox}
          <IconTip label="Analytics">
            <Link href={v7("analytics")} aria-label="Analytics" aria-current={active === "analytics" ? "page" : undefined} className="dm-quiet flex size-9 items-center justify-center rounded-full" style={{ color: active === "analytics" ? "var(--foreground)" : "var(--muted-foreground)" }}>
              <BarChart3 className="h-5 w-5" aria-hidden />
            </Link>
          </IconTip>
          <QuickLinksMenu />
        </div>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[22px] px-5 pt-3 pb-[120px] sm:px-[var(--space-14)] md:pt-8">
        {onProfile ? (
          // the counselor's ID card profile (v4's, with the lanyard), over Home
          <>
            <V7Home />
            <CounselorProfileSheet open name={COUNSELOR.name} role="School Counselor" onClose={() => router.push(v7("home"))} />
          </>
        ) : onReviews ? (
          <V7Workspace key={tab} initial={tab ?? "reviews"} />
        ) : active === "home" ? (
          <V7Home />
        ) : active === "students" ? (
          <V7Students key={studentId ?? "list"} studentId={studentId} tab={tab} />
        ) : active === "explore" ? (
          <V7Explore />
        ) : active === "prepare" ? (
          <V7Prepare key={studentId ?? "agenda"} studentId={studentId} />
        ) : active === "opportunities" ? (
          <V7Opportunities />
        ) : (
          <V7Analytics />
        )}
      </main>
      <LogSheetHost />
      <ExploreSheetHost career={V7CareerSheet} school={V7SchoolSheet} />
      <OppSheetHost />
      <MobileNav active={navLabel} items={MOBILE_NAV} profile={{ href: v7("profile"), label: COUNSELOR.name, node: <CounselorBadge size={28} /> }} />
    </div>
  );
}
