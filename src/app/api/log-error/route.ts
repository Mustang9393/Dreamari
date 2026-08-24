import { NextResponse } from "next/server";

// See src/lib/errorReporting.ts -- the one backend endpoint in this
// otherwise backend-less prototype (added specifically because a real
// mobile bug had no reproduction and no stack trace). Logs to the server
// console, which Vercel surfaces in the deployment's function logs, and
// does nothing else -- no persistence, no database, no PII beyond whatever
// the browser's own userAgent string carries.
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    console.error("[client-error]", JSON.stringify(body));
  } catch {
    // Malformed payload -- nothing usable to log.
  }
  return new NextResponse(null, { status: 204 });
}
