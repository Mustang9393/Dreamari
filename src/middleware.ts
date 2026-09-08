import { NextResponse, type NextRequest } from "next/server";

// A lightweight view-gate for the Vercel deployment (direct feedback, 9 Sept
// 2026: "password protect my vercel build so anybody cannot steal our
// work"). Not real security -- there's no login, no per-user account, just
// one shared PIN that unlocks a cookie for anyone who knows it. That's the
// right amount of protection for "stop a stranger with the link from
// browsing the prototype," not "protect sensitive data."
const GATE_COOKIE = "dm_gate";
const GATE_TOKEN = "granted";

export function middleware(request: NextRequest) {
  if (request.cookies.get(GATE_COOKIE)?.value === GATE_TOKEN) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

// Excludes Next's own static/image pipeline, the gate page itself and its
// API route (or every request would redirect-loop), and every other API
// route (fire-and-forget calls like /api/log-error shouldn't get rewritten
// into a redirect response).
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|gate|api).*)"],
};
