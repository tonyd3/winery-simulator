import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, deserialize, newGame, serialize } from '../src/game.ts';
import type { Action } from '../src/game.ts';
import { DEFAULT_DESIGN, isSmallReserve, volume } from '../src/winemaking.ts';
import { learn } from './helpers.ts';

function stored(amounts: number[]) {
  const s = newGame();
  s.reserves = amounts.map((ml, index) => ({
    id: index + 1,
    name: `Merlot lot ${index + 1}`,
    stored: s.week,
    score: null,
    components: [{ variety: 'merlot', year: 1, ml, quality: 75 }],
  }));
  s.nextId = amounts.length + 1;
  return deserialize(serialize(s));
}

test('bottling leftovers can be cleared without changing releases, resources, or larger lots', () => {
  let before = stored([1000, 2000, 750, 12000]);
  before = act(before, {
    type: 'bottle',
    id: 1,
    bottles: 1,
    line: { name: 'Estate Merlot', design: DEFAULT_DESIGN },
  });
  before = act(before, {
    type: 'bottle',
    id: 2,
    bottles: 2,
    line: { id: before.lines[0].id },
  });
  assert.deepEqual(
    before.reserves.map((r) => volume(r.components)),
    [250, 500, 750, 12000],
  );
  const copy = structuredClone(before);
  const action: Action = {
    type: 'discardSmallReserves',
    lots: [
      { id: 1, ml: 250 },
      { id: 2, ml: 500 },
    ],
  };
  const after = act(before, action);
  assert.deepEqual(before, copy);
  assert.deepEqual(after.reserves, before.reserves.slice(2));
  // Every other field, including RNG, stats, cash, kits, scores and history, is unchanged.
  assert.deepEqual(
    { ...after, reserves: before.reserves, log: before.log },
    before,
  );
  assert.match(after.log[0].text, /Discarded 0.75 L.*2 reserve spaces/);
  assert.deepEqual(deserialize(serialize(after)), after);
  assert.deepEqual(act(deserialize(serialize(before)), action), after);
  assert.throws(() => act(after, action), /changed/);
});

test('cleanup uses the full lot volume and excludes a complete 750 mL bottle', () => {
  const s = stored([1, 749, 750, 751, 1000]);
  s.reserves[4].components = [
    { variety: 'merlot', year: 1, ml: 500, quality: 75 },
    { variety: 'cabernet', year: 1, ml: 500, quality: 78 },
  ];
  assert.deepEqual(
    s.reserves.filter(isSmallReserve).map((r) => r.id),
    [1, 2],
  );
  const next = act(s, {
    type: 'discardSmallReserves',
    lots: [
      { id: 1, ml: 1 },
      { id: 2, ml: 749 },
    ],
  });
  assert.deepEqual(next.reserves, s.reserves.slice(2));
  for (const lot of s.reserves.slice(2)) {
    assert.throws(
      () =>
        act(s, {
          type: 'discardSmallReserves',
          lots: [{ id: lot.id, ml: volume(lot.components) }],
        }),
      /smaller than one 750 mL bottle/,
    );
  }
});

test('invalid or stale cleanup reviews fail atomically', () => {
  const s = stored([250, 500, 750]);
  const copy = structuredClone(s);
  const invalid: { id: number; ml: number }[][] = [
    [],
    [
      { id: 1, ml: 250 },
      { id: 1, ml: 250 },
    ],
    [
      { id: 1, ml: 250 },
      { id: 99, ml: 500 },
    ],
    [
      { id: 1, ml: 250 },
      { id: 2, ml: 499 },
    ],
    [
      { id: 1, ml: 250 },
      { id: 3, ml: 750 },
    ],
    ...[0, -1, 0.5, NaN, Infinity].map((ml) => [{ id: 1, ml }]),
  ];
  for (const lots of invalid) {
    assert.throws(() => act(s, { type: 'discardSmallReserves', lots }));
    assert.deepEqual(s, copy);
  }
});

test('a full cellar of tiny lots can be emptied without research, cash or kits', () => {
  const s = stored(Array(256).fill(250));
  s.cash = 0;
  s.kits = 0;
  s.knowledge = 0;
  const next = act(s, {
    type: 'discardSmallReserves',
    lots: s.reserves.map((r) => ({ id: r.id, ml: volume(r.components) })),
  });
  assert.equal(next.reserves.length, 0);
  assert.match(next.log[0].text, /Discarded 64 L.*256 reserve spaces/);
  assert.deepEqual(deserialize(serialize(next)), next);
});

test('leftovers can instead be blended and bottled with exact volume conservation', () => {
  let s = stored([250, 500]);
  const blend: Action = {
    type: 'blend',
    name: 'Last drops',
    portions: s.reserves.map((r) => ({ id: r.id, ml: volume(r.components) })),
  };
  assert.throws(() => act(s, blend), /Research Cellar foundations/);
  s = act(learn(s, 'oenology'), blend);
  assert.equal(s.reserves.length, 1);
  assert.equal(volume(s.reserves[0].components), 750);
  assert.equal(isSmallReserve(s.reserves[0]), false);
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 1,
    line: { name: 'Last drops', design: DEFAULT_DESIGN },
  });
  assert.equal(s.reserves.length, 0);
  assert.equal(volume(s.wines[0].components), 750);
  assert.deepEqual(deserialize(serialize(s)), s);
});
