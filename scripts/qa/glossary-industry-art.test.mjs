import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { glossaryTermAssets } from '../../src/components/glossary/termArt.ts';
import { welcomeArtFor } from '../../src/components/glossary/welcomeArt.ts';

const careers = { software: 'software-engineer', aviation: 'airline-pilot', nursing: 'registered-nurse' };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let totalBytes = 0, exports = 0;
for (const [industry, career] of Object.entries(careers)) {
  const file = `docs/reference/glossary-${industry}-art-oct17`;
  const m = JSON.parse(await readFile(`${file}.json`, 'utf8'));
  assert.equal(m.terms.length, 5);
  assert.ok(m.terms.every(t => t.level === 1));
  for (const [theme, atmosphere] of [['drift', 'v1'], ['signal', 'v2']]) {
    const large = glossaryTermAssets(career, atmosphere), small = glossaryTermAssets(career, atmosphere, 'small');
    assert.deepEqual(Object.keys(large).sort(), m.terms.map(t => t.id).sort());
    assert.equal(welcomeArtFor(industry, 'L1', theme), `/images/glossary/${m.version}/${theme}/welcome.webp`);
    const files = await readdir(`public/images/glossary/${m.version}/${theme}`);
    assert.equal(files.length, 12, 'Five terms and one welcome, each in two sizes');
    for (const t of m.terms) {
      assert.equal(large[t.id], `/images/glossary/${m.version}/${theme}/${t.slug}.webp`);
      assert.ok(small[t.id].endsWith(theme === 'signal' ? '-320.webp' : '-256.webp'));
    }
  }
  for (const kind of ['receipt', 'welcome-receipt']) {
    const receipt = JSON.parse(await readFile(`${file}-${kind}.json`, 'utf8'));
    for (const asset of receipt.assets) for (const output of asset.outputs) {
      const bytes = await readFile(output.path), meta = await sharp(bytes).metadata();
      assert.equal(hash(bytes), output.sha256, output.path);
      assert.equal(meta.width, output.width); assert.equal(meta.height, output.height); assert.ok(meta.hasAlpha);
      totalBytes += bytes.length; exports++;
    }
  }
}
assert.equal(exports, 72);
assert.deepEqual(glossaryTermAssets('not-registered', 'v1'), {});
assert.deepEqual(glossaryTermAssets('software-engineer', 'v3'), {});
assert.ok(Object.values(glossaryTermAssets('investment-banking', 'v1')).every(p => p.includes('/finance-oct13/')));
const engine = await readFile('src/components/glossary/GlossaryLabGameExperience.tsx', 'utf8');
assert.ok(engine.includes('lesson.lessonNumber > 1 || Object.keys(authoredLarge).length === 0'), 'Later levels remain words-only even when their career has registered art');
console.log(`Passed: three scoped Level 1 packs, six welcomes, 72 alpha exports and hash receipts (${totalBytes.toLocaleString()} bytes); Finance and words-only later-level contracts retained.`);
