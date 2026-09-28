// Builds a ready-to-paste Codex prompt pack from two small JSON files
// (cast.json, rooms.json) so a new career's art request doesn't require
// retyping the frozen sprite master prompt by hand. Codex (an image model)
// generates the actual pictures from these prompts; this script only writes
// the text.
import fs from "node:fs";

const ROLE_EXPRESSIONS = {
  mentor: ["welcoming", "proud", "concerned"],
  judge: ["composed", "assessing", "concerned"],
  peer: ["confident", "focused", "uncertain"],
  top: ["composed"],
};

const ROLE_TITLE = { mentor: "Mentor", judge: "Judge", peer: "Peer", top: "Figure at the top" };

function titleCase(role) {
  return ROLE_TITLE[role] || role.charAt(0).toUpperCase() + role.slice(1);
}

/** Rewrites only the `== CAST ==` block of the frozen master prompt, byte
 *  identical otherwise, per docs/handoff/play-sop/07-art-direction-and-
 *  prompts.md s3.1 ("change ONLY the CAST rows"). Returns just the box's
 *  text (without the outer ``` fence), ready to be re-fenced by the caller. */
export function buildSpriteBox(masterPromptMd, cast) {
  const boxMatch = masterPromptMd.match(/```\n([\s\S]*?)\n```/);
  if (!boxMatch) throw new Error("could not find the fenced master prompt block in sprite-master-prompt.md");
  const box = boxMatch[1];

  const castStart = box.indexOf("== CAST ==");
  const castEnd = box.indexOf("== ACCEPTANCE CHECKLIST"); // the heading has "(verify EVERY line...)" after it
  if (castStart < 0 || castEnd < 0) throw new Error("sprite-master-prompt.md's CAST/ACCEPTANCE markers moved; update prompts.mjs");

  let n = 0;
  const lines = ["== CAST ==", "(fill one row per sprite; filename is exactly as written)", ""];
  for (const person of cast) {
    const role = person.role;
    const expressions = ROLE_EXPRESSIONS[role];
    if (!expressions) throw new Error(`cast.json: "${person.name}" has unknown role "${role}" (expected mentor|judge|peer|top)`);
    lines.push(`CHARACTER: ${person.name} -- ${person.title || titleCase(role)}. Identity: ${person.identity}`);
    for (const expr of expressions) {
      n += 1;
      const fname = `${person.name.toLowerCase().replace(/\s+/g, "-")}-${expr}.png`;
      lines.push(`  ${n}. ${fname}  -- ${expr.toUpperCase()}`);
    }
    lines.push("");
  }
  const castBlock = lines.join("\n").trimEnd() + "\n\n";

  return box.slice(0, castStart) + castBlock + box.slice(castEnd);
}

/** One people-free plate prompt per room, following the same hard rules as
 *  the SOP's background-separation companion prompt (chapter 7 s3.2): no
 *  people, no text/logos/brands, open floor at the standing column. */
export function buildPlatePrompt(room, careerFolder) {
  return [
    `## Plate: ${room.id}.png -> public/images/play/${careerFolder}/locations/${room.id}.webp`,
    "",
    `Generate a people-free interior/exterior scene: ${room.description}${room.time ? `, ${room.time}` : ""}.`,
    "",
    "Requirements (non-negotiable, matches every other plate in this app):",
    "- No people, no reflections or shadows implying a person just left frame.",
    "- 16:9, at least 1920x1080, camera at eye level, no dramatic tilt or fisheye.",
    "- The floor at the horizontal centre of the frame (x 40%-60%) must be clear and continuous from the bottom edge up to about 45% of the height -- a character cutout stands there.",
    "- No text, readable signage, readable screens, logos or real brands anywhere.",
    "- Same illustration style, line weight and colour grade as this career's other references -- do not mix photographic and illustrated looks.",
    "",
  ].join("\n");
}

export function buildPromptPack({ masterPromptMd, cast, rooms, careerId, careerFolder }) {
  const spriteBox = buildSpriteBox(masterPromptMd, cast);
  const plateSection = rooms.map((r) => buildPlatePrompt(r, careerFolder)).join("\n");
  return [
    `# Art prompt pack: ${careerId}`,
    "",
    "These prompts run in Codex (an image-generating model) -- paste each one in and save the returned image under the matching path. Claude cannot generate images itself.",
    "",
    "## Sprites",
    "",
    "Attach the character reference art first, then paste the block below.",
    "",
    "```",
    spriteBox,
    "```",
    "",
    "## Plates",
    "",
    plateSection,
  ].join("\n");
}

export function readJSONSafe(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
