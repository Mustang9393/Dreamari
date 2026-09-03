// Fetch free imagery for the college lookup prototype:
//  - a campus photo from Wikimedia Commons (CC licences, credit kept)
//  - the college's Wikipedia lead image (seal/logo) as a small mark
// Writes public/images/colleges/<slug>.webp and <slug>-mark.webp plus
// public/images/colleges/credits.json. Prototype only: licences vary
// (CC BY-SA needs attribution; en.wikipedia seals are often fair use).
import sharp from "sharp";
import { writeFileSync, existsSync, readFileSync } from "node:fs";

const UA = { "User-Agent": "Dreamari-prototype/0.1 (ux@dreamopportunity.org)" };
const colleges = JSON.parse(readFileSync(new URL("./seed-names.json", import.meta.url)));
const credits = existsSync("public/images/colleges/credits.json") ? JSON.parse(readFileSync("public/images/colleges/credits.json")) : {};

async function json(url) { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); }
async function bytes(url) { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(`${r.status} ${url}`); return Buffer.from(await r.arrayBuffer()); }

for (const { slug, name, wiki, query } of colleges) {
  if (query === null) continue;
  const out = `public/images/colleges/${slug}.webp`;
  const credit = credits[slug] ?? {};
  try {
    if (!existsSync(out)) {
      const q = encodeURIComponent(query ?? `${name} campus`);
      const d = await json(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1400&format=json`);
      const pages = Object.values(d.query?.pages ?? {});
      const pick = pages
        .map((p) => ({ title: p.title, ...p.imageinfo[0] }))
        .filter((i) => /\.(jpe?g|png)$/i.test(i.title) && i.width >= 1000 && i.width > i.height * 1.1 && /CC|Public domain/i.test(i.extmetadata?.LicenseShortName?.value ?? ""))
        .sort((a, b) => b.width - a.width)[0];
      if (pick) {
        const buf = await bytes(pick.thumburl);
        await sharp(buf).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
        Object.assign(credit, { photo: pick.title.replace(/^File:/, ""), photoLicense: pick.extmetadata?.LicenseShortName?.value, photoAuthor: (pick.extmetadata?.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim(), photoUrl: pick.descriptionurl });
        console.log("photo ", slug, pick.width, pick.extmetadata?.LicenseShortName?.value);
      } else console.log("photo ", slug, "none");
    }
    const markOut = `public/images/colleges/${slug}-mark.webp`;
    if (!existsSync(markOut) && wiki !== null) {
      const s = await json(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki ?? name.replace(/ /g, "_"))}`);
      const src = s.originalimage?.source;
      if (src) {
        const buf = await bytes(src);
        await sharp(buf).resize({ width: 320, height: 320, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toFile(markOut);
        Object.assign(credit, { mark: src.split("?")[0], wikipedia: s.content_urls?.desktop?.page, summary: s.extract });
        console.log("mark  ", slug);
      } else console.log("mark  ", slug, "none");
    }
  } catch (e) { console.log("ERR   ", slug, String(e.message).slice(0, 80)); }
  credits[slug] = credit;
}
writeFileSync("public/images/colleges/credits.json", JSON.stringify(credits, null, 2));
