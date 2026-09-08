import { learn } from './helpers.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, deserialize, newGame, serialize } from '../src/game.ts';
import {
  assess,
  blendProfile,
  CELLAR_TASTING,
  DEFAULT_DESIGN,
  volume,
} from '../src/winemaking.ts';
import type { GameState } from '../src/game.ts';
import type { WineComponent } from '../src/winemaking.ts';

function stored() {
  const s = newGame();
  s.week = 20;
  s.reserves = [
    {
      id: 1,
      name: 'Terre et Lumière',
      stored: 20,
      score: null,
      components: [
        { variety: 'merlot', year: 1, ml: 60000, quality: 77 },
        { variety: 'cabernet', year: 2, ml: 40000, quality: 83 },
      ],
    },
  ];
  s.nextId = 2;
  return s;
}
const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);
const bottle = (s: GameState, count: number, lineId?: number) =>
  act(s, {
    type: 'bottle',
    id: 1,
    bottles: count,
    line:
      lineId === undefined
        ? { name: 'Terre et Lumière', design: DEFAULT_DESIGN }
        : { id: lineId },
  });

test('blend analysis aggregates source years and intrinsic quality without changing its recipe', () => {
  const parts: WineComponent[] = [
    { variety: 'merlot', year: 1, ml: 3000, quality: 80 },
    { variety: 'merlot', year: 1, ml: 1000, quality: 88 },
    { variety: 'cabernet', year: 2, ml: 1000, quality: 92 },
  ];
  const copy = structuredClone(parts),
    profile = blendProfile(parts);
  assert.deepEqual(parts, copy);
  assert.equal(profile.base, 84);
  assert.ok(Math.abs(profile.compatibility - 2.56) < 1e-9);
  assert.equal(profile.expected, 87);
  assert.deepEqual([profile.low, profile.high], [84, 90]);
  assert.deepEqual(profile.sources, [
    { variety: 'cabernet', year: 2, quality: 92, share: 20 },
    { variety: 'merlot', year: 1, quality: 82, share: 80 },
  ]);
  assert.equal(profile.dominant!.variety, 'merlot');
});

test('multiple vintages do not count as different grapes', () => {
  const single = stored().reserves[0].components.map((p) => ({
    ...p,
    variety: 'merlot',
  }));
  assert.equal(blendProfile(single).compatibility, 0);
  assert.equal(blendProfile(single).varietyCount, 1);
  assert.equal(blendProfile(single).sources.length, 2);
  assert.equal(blendProfile([]).dominant, null);
});

test('a cellar tasting charges once, consumes no inventory or time, and matches the normal bottle assessment', () => {
  const before = stored(),
    copy = structuredClone(before);
  const normalBottle = bottle(before, 1);
  const s = act(before, { type: 'tasteReserve', id: 1 });
  assert.deepEqual(before, copy);
  assert.equal(s.cash, before.cash - CELLAR_TASTING.cost);
  assert.equal(s.ledger[0].amount, -CELLAR_TASTING.cost);
  assert.equal(s.reserves[0].score, normalBottle.wines[0].quality);
  assert.equal(s.seed, normalBottle.seed);
  assert.deepEqual(s.reserves[0].components, before.reserves[0].components);
  assert.equal(s.week, before.week);
  assert.equal(s.kits, before.kits);
  assert.equal(s.knowledge, before.knowledge);
  assert.deepEqual(s.stats, before.stats);
  assert.equal(s.wines.length, 0);
  assert.deepEqual(
    act(deserialize(serialize(before)), { type: 'tasteReserve', id: 1 }),
    s,
  );
  valid(s);
});

test('saved tastings stay fixed through partial bottles, new releases, and repeat requests', () => {
  let s = act(learn(stored(), 'vintage_blending'), {
    type: 'tasteReserve',
    id: 1,
  });
  const score = s.reserves[0].score,
    seed = s.seed;
  s = bottle(deserialize(serialize(s)), 40);
  s = bottle(deserialize(serialize(s)), 20, s.lines[0].id);
  assert.deepEqual(
    s.wines.map((w) => w.quality),
    [score, score],
  );
  assert.equal(s.seed, seed);
  assert.equal(s.reserves[0].score, score);
  assert.equal(volume(s.reserves[0].components), 55000);
  const copy = structuredClone(s);
  assert.throws(() => act(s, { type: 'tasteReserve', id: 1 }), /already/);
  assert.deepEqual(s, copy);
  valid(s);
});

test('failed tastings preserve cash, score and RNG; a recorded zero is never rerolled', () => {
  const poor = stored();
  poor.cash = CELLAR_TASTING.cost - 1;
  const copy = structuredClone(poor);
  assert.throws(() => act(poor, { type: 'tasteReserve', id: 1 }), /more/);
  assert.throws(
    () => act(poor, { type: 'tasteReserve', id: 999 }),
    /not found/,
  );
  assert.deepEqual(poor, copy);
  const zero = stored();
  zero.reserves[0].score = 0;
  assert.throws(() => act(zero, { type: 'tasteReserve', id: 1 }), /already/);
  const bottled = bottle(zero, 1);
  assert.equal(bottled.wines[0].quality, 0);
  assert.equal(bottled.seed, zero.seed);
  valid(bottled);
});

test('tasting bounds remain valid at score limits and a new blend receives its own assessment', () => {
  for (const quality of [0, 100]) {
    const s = stored();
    s.reserves[0].components.forEach((p) => (p.quality = quality));
    const profile = blendProfile(s.reserves[0].components);
    const tasted = act(s, { type: 'tasteReserve', id: 1 });
    assert.ok(tasted.reserves[0].score! >= profile.low);
    assert.ok(tasted.reserves[0].score! <= profile.high);
    assert.ok(profile.low >= 0 && profile.high <= 100);
    valid(tasted);
  }
  let s = act(learn(stored(), 'vintage_blending'), {
    type: 'tasteReserve',
    id: 1,
  });
  const previousScore = s.reserves[0].score;
  s.reserves.push({
    id: s.nextId++,
    name: 'Extra Merlot',
    stored: 20,
    score: 0,
    components: [{ variety: 'merlot', year: 2, quality: 90, ml: 5000 }],
  });
  s = act(s, {
    type: 'blend',
    name: 'Second recipe',
    portions: [
      { id: 1, ml: 5000 },
      { id: 2, ml: 5000 },
    ],
  });
  assert.equal(s.reserves[0].score, previousScore);
  const newBlend = s.reserves.at(-1)!;
  assert.equal(newBlend.score, null);
  assert.equal(assess(newBlend.components).base, 84.7);
  assert.ok(Math.abs(assess(newBlend.components).compatibility - 2.56) < 1e-9);
  assert.equal(volume(newBlend.components), 10000);
  valid(s);
});
