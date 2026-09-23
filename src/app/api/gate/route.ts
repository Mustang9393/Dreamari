import { NextResponse } from "next/server";

// Backs the /gate PIN screen (see src/middleware.ts). One shared 4-digit
// code, not per-user auth -- overridable via the GATE_PASSWORD env var on
// Vercel without touching code; falls back to the code given to the team.
//
// Rotated 23 Sept 2026 (direct instruction: "reset that code... make sure
// everybody old and new have to put in the code after our next push").
// Changing GATE_PASSWORD alone would NOT have done that -- anyone who'd
// already passed the old PIN was still carrying a valid 90-day dm_gate
// cookie, and the old check only verified `dm_gate === "granted"`, never
// which code earned it. Renaming the cookie itself (below and in
// middleware.ts) is what actually revokes every existing session,
// cached or not: the new middleware only recognizes the new cookie name,
// so every visitor -- including whoever tested the old PIN -- hits the
// gate again on their next request, same as someone arriving cold.
const GATE_PASSWORD = process.env.GATE_PASSWORD ?? "4917";
const GATE_COOKIE = "dm_gate_2";
const GATE_TOKEN = "granted";

export async function POST(request: Request): Promise<NextResponse> {
  let code = "";
  try {
    const body: unknown = await request.json();
    code = typeof (body as { code?: unknown })?.code === "string" ? (body as { code: string }).code : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (code !== GATE_PASSWORD) return NextResponse.json({ ok: false }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, GATE_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
