import { NextResponse } from "next/server";

// Backs the /gate PIN screen (see src/middleware.ts). One shared 4-digit
// code, not per-user auth -- overridable via the GATE_PASSWORD env var on
// Vercel without touching code; falls back to the code given to the team.
const GATE_PASSWORD = process.env.GATE_PASSWORD ?? "6284";
const GATE_COOKIE = "dm_gate";
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
