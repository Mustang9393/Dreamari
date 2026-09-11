import { NextResponse } from "next/server";

// Demo requests from the Schools page (direct instruction, 11 Sept 2026: the
// visitor should not have to open a mail app; the backend receives and sends).
// Two posts per request: step 1 carries the priority fields, step 2 the short
// survey, both with the same client-generated id so the inbox can pair them.
// Delivery, in order: DEMO_REQUEST_WEBHOOK (a Google Apps Script web app
// bound to the team's Google Sheet, which appends a row and emails the
// inbox), then RESEND_API_KEY (Resend's REST API). Without either, the
// request is logged to the function logs and still acknowledged, so the page
// never dead-ends on a missing key.

const TO = process.env.DEMO_REQUEST_TO ?? "product@dreamopportunity.org";
const FROM = process.env.DEMO_REQUEST_FROM ?? "Dreamari <onboarding@resend.dev>";

type Payload = {
  id?: string;
  step?: "request" | "survey";
  name?: string;
  email?: string;
  organization?: string;
  role?: string;
  orgType?: string;
  students?: string;
  page?: string;
};

const text = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request): Promise<NextResponse> {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const step = body.step === "survey" ? "survey" : "request";
  const fields = {
    id: text(body.id, 40),
    name: text(body.name),
    email: text(body.email),
    organization: text(body.organization),
    role: text(body.role),
    orgType: text(body.orgType),
    students: text(body.students, 40),
    page: text(body.page, 300),
  };
  if (step === "request" && (!fields.email.includes("@") || !fields.organization)) {
    return NextResponse.json({ ok: false, error: "Email and organization are required" }, { status: 400 });
  }

  const subject = step === "request" ? `Demo request: ${fields.organization}` : `Demo request details: ${fields.organization || fields.id}`;
  const lines =
    step === "request"
      ? [`Name: ${fields.name}`, `Work email: ${fields.email}`, `Organization: ${fields.organization}`]
      : [`Role: ${fields.role || "not given"}`, `Organization type: ${fields.orgType || "not given"}`, `Students served: ${fields.students || "not given"}`];
  const bodyText = [...lines, "", `Request id: ${fields.id}`, `From: ${fields.page}`, `Received: ${new Date().toISOString()}`].join("\n");

  const webhook = process.env.DEMO_REQUEST_WEBHOOK;
  let delivered = false;
  if (webhook) {
    try {
      const res = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, step, subject, receivedAt: new Date().toISOString() }), redirect: "follow" });
      delivered = res.ok;
      if (!res.ok) console.error("[demo-request] webhook failed", res.status);
    } catch (err) {
      console.error("[demo-request] webhook error", err);
    }
  }

  const key = process.env.RESEND_API_KEY;
  if (key && !delivered) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: [TO], reply_to: fields.email || undefined, subject, text: bodyText }),
      });
      if (!res.ok) {
        console.error("[demo-request] resend failed", res.status, await res.text());
        console.log("[demo-request]", subject, "\n" + bodyText);
      }
    } catch (err) {
      console.error("[demo-request] resend error", err);
      console.log("[demo-request]", subject, "\n" + bodyText);
    }
  } else if (!delivered) {
    // Nothing configured: the function log is the inbox until one is.
    console.log("[demo-request]", subject, "\n" + bodyText);
  }
  return NextResponse.json({ ok: true });
}
