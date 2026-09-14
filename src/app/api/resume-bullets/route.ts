import { NextResponse } from "next/server";

// Resume Builder's "generate bullets" step. The first real AI-backed feature
// in this repo -- calls Claude when ANTHROPIC_API_KEY is set, otherwise falls
// back to a client-agnostic template transform so the flow works end-to-end
// with zero setup and upgrades automatically once the key is added (same
// shape as demo-request/route.ts's "still function gracefully" pattern).

type ExperienceType = "job" | "internship" | "research" | "volunteer" | "club" | "other";

type Payload = {
  type?: ExperienceType;
  title?: string;
  where?: string;
  answers?: Record<string, string>;
};

const text = (v: unknown, max = 400) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const FALLBACK_VERB: Record<ExperienceType, string> = {
  job: "Handled",
  internship: "Contributed to",
  research: "Investigated",
  volunteer: "Volunteered to support",
  club: "Participated in",
  other: "Worked on",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// The plain-English questions this feeds from ("What did you do day-to-day?")
// invite a conversational answer, not a resume-ready phrase -- and without
// an API key, this fallback IS the bullet, verbatim capitalization aside
// (the "AI-drafted, edit this" banner only shows when `aiAssisted` is true,
// so a student sees this as finished, not a draft). Stripping the most
// common conversational tells -- a first-person opener, filler words, "like"
// used as a casual quantifier -- turns "I basically just stood at the
// register all day" into "stood at the register all day": still not a
// polished AI rewrite (no real NLP here), but no longer something that
// reads as obviously unedited.
function cleanAnswer(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^i\s+(?:'m\s+|was\s+|'d\s+|would\s+)?(?:basically\s+|literally\s+|just\s+|kind of\s+|sort of\s+|really\s+)*/i, "");
  s = s.replace(/\b(?:basically|literally|kind of|sort of)\b\s*/gi, "");
  s = s.replace(/\blike\s+(?=\d)/gi, "");
  return s.replace(/\s{2,}/g, " ").trim();
}

function templateBullets(type: ExperienceType, where: string, answers: Record<string, string>): string[] {
  const lines: string[] = [];
  const dayToDay = answers.dayToDay?.trim() && cleanAnswer(answers.dayToDay);
  const tools = answers.tools?.trim() && cleanAnswer(answers.tools);
  const team = answers.team?.trim() && cleanAnswer(answers.team);
  const proud = answers.proud?.trim() && cleanAnswer(answers.proud);
  // The day-to-day answer is already phrased as a verb phrase (its own
  // placeholder models that), so it becomes the bullet directly rather than
  // getting a second verb stacked in front of it.
  if (dayToDay) lines.push(`${cap(dayToDay)}${where ? ` at ${where}` : ""}`);
  if (tools) lines.push(`Used ${tools} to support day-to-day tasks`);
  if (team) lines.push(`Worked closely with ${team}`);
  if (proud) lines.push(`Recognized for ${proud.charAt(0).toLowerCase()}${proud.slice(1)}`);
  return lines.length > 0 ? lines : [`${FALLBACK_VERB[type] ?? FALLBACK_VERB.other} day-to-day responsibilities${where ? ` at ${where}` : ""}`];
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const type = (["job", "internship", "research", "volunteer", "club", "other"] as ExperienceType[]).includes(body.type as ExperienceType) ? (body.type as ExperienceType) : "other";
  const where = text(body.where, 120);
  const title = text(body.title, 120);
  const answers: Record<string, string> = {};
  if (body.answers && typeof body.answers === "object") {
    for (const [k, v] of Object.entries(body.answers)) answers[text(k, 40)] = text(v, 400);
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const prompt = `Write 2-4 short, resume-style bullet points (no bullet characters, one per line, action-verb first, past tense, no first person) for a high school student's "${title || type}" experience at "${where}", based on these answers:\n${Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join("\n")}\nReturn ONLY the bullet lines, one per line, nothing else.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
      });
      if (res.ok) {
        const data = (await res.json()) as { content?: { type: string; text?: string }[] };
        const raw = data.content?.find((c) => c.type === "text")?.text ?? "";
        const bullets = raw.split("\n").map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim()).filter(Boolean);
        if (bullets.length > 0) return NextResponse.json({ ok: true, bullets, aiAssisted: true });
      } else {
        console.error("[resume-bullets] anthropic failed", res.status);
      }
    } catch (err) {
      console.error("[resume-bullets] anthropic error", err);
    }
  }
  return NextResponse.json({ ok: true, bullets: templateBullets(type, where, answers), aiAssisted: false });
}
