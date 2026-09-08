import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  releaseCount,
  wineSales,
} from '../src/game.ts';
import { portion } from '../src/winemaking.ts';
function archiveEstate() {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 1,
    line: {
      name: 'Long history',
      design: { style: 'estate', bottle: 'rounded', color: 'olive' },
    },
  });
  const w = s.wines[0];
  s.wines = Array.from({ length: 1000 }, (_, i) => ({
    ...structuredClone(w),
    id: s.nextId++,
    release: i + 1,
    bottles: 0,
    produced: 1,
    components: portion(w.components, 750),
  }));
  s.stats.bottled = 1000;
  s.stats.sold = 1000;
  return deserialize(serialize(s));
}
test('a 1000-release save can keep bottling without losing totals or reusing release numbers', () => {
  let s = archiveEstate();
  s.wines[2].produced = null;
  s.wines[2].salesSinceTracking = 1;
  s.wines[5].bottles = 1; // Unsold stock must never be compacted.
  const retained = s.wines[5].id;
  const count = wineSales(s.wines).count;
  const next = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 1,
    line: { id: s.lines[0].id },
  });
  assert.equal(releaseCount(next), 1001);
  assert.equal(next.wines.at(-1)!.release, 1001);
  assert.ok(next.wines.some((w) => w.id === retained));
  assert.ok(next.wines.length < 1000);
  assert.equal(
    next.lines[0].archive!.sold + wineSales(next.wines).count,
    count,
  );
  assert.equal(next.lines[0].archive!.complete, false);
  assert.deepEqual(deserialize(serialize(next)), next);
});
test('full active stock gives an actionable, atomic capacity error', () => {
  const s = archiveEstate();
  s.wines.forEach((w) => (w.bottles = 1));
  const before = structuredClone(s);
  assert.throws(
    () =>
      act(s, {
        type: 'bottle',
        id: s.reserves[0].id,
        bottles: 1,
        line: { id: s.lines[0].id },
      }),
    /Sell some stock/,
  );
  assert.deepEqual(s, before);
});
