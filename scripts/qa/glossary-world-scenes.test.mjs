import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { worldScene, sceneStyle } from '../../src/components/glossary/worldScenes.ts';

for (const world of ['Business & Finance', 'Health & Medicine', 'Tech & Engineering']) {
  assert.equal(worldScene('finance', world, 4, 'Advanced'), null, 'Finance must retain its exact old path');
}
for (const world of ['Health & Medicine', 'Tech & Engineering', 'A world added next year']) {
  const phases = new Set();
  for (let level = 1; level <= 4; level++) {
    const scene = worldScene('new-industry', world, level, 'Beginner');
    phases.add(scene.phase);
    assert.deepEqual(scene, worldScene('new-industry', world, level, 'Beginner'), 'Stable across hydration and visits');
    assert.deepEqual(scene, worldScene('another-industry', world, level, 'Beginner'), 'No per-industry artwork or special case');
    assert.equal(sceneStyle(scene, 10)['--scene-mastery'], 1);
    assert.equal(sceneStyle(scene, -1)['--scene-mastery'], 0);
  }
  assert.equal(phases.size, 4, 'Four consecutive levels feel like different days');
}
assert.deepEqual(sceneStyle(null), {});
const css = await readFile('src/components/glossary/glossary-living-worlds.css', 'utf8');
assert.ok(!/(?:backdrop-filter|\bfilter)\s*:/.test(css), 'No compositor-costly filter effects');
assert.ok(!/#[a-f\d]{3,8}\b/i.test(css), 'Use semantic tokens, not a new local palette');
assert.ok(css.includes('prefers-reduced-motion: reduce'));
for (const block of css.split('@keyframes').slice(1)) {
  const keys = block.slice(0, block.indexOf('\n'));
  assert.ok(!/background-position|\bleft\s*:|\btop\s*:|\bwidth\s*:|\bheight\s*:/.test(keys), 'No layout or background-position animation');
}
console.log('Passed: deterministic asset-free scenes, world inheritance, four phases, Finance bypass, mastery clamp and CSS performance contracts.');
