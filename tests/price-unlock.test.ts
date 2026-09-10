import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  bottlePriceLimit,
  retailPrice,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { DEFAULT_DESIGN } from '../src/winemaking.ts';

function prepared() {
  const s = newGame();
  s.reputation = 65000;
  for (const score of [97, 98, 75]) {
    s.reserves.push({
      id: s.nextId++,
      name: `Prepared ${score}`,
      stored: s.week,
      score,
      components: [{ variety: 'merlot', year: 1, ml: 7500, quality: score }],
    });
  }
  return s;
}
function bottle(s: GameState, score: number) {
  return act(s, {
    type: 'bottle',
    id: s.reserves.find((r) => r.score === score)!.id,
    bottles: 1,
    line: { name: `Release ${s.stats.bottled}`, design: DEFAULT_DESIGN },
  });
}

test('97-point bottlings and high Prestige keep the retail cap at $1,000', () => {
  const s = bottle(prepared(), 97);
  assert.equal(s.stats.best, 97);
  assert.equal(bottlePriceLimit(s), 1000);
  assert.equal(s.wines[0].price, 1000);
  assert.equal(retailPrice({ quality: 100 }, s), 1000);
  s.wines[0].judging = { remaining: 0, score: 100 };
  assert.equal(bottlePriceLimit(deserialize(serialize(s))), 1000);
  assert.equal(
    act(s, { type: 'price', id: s.wines[0].id, price: 1000 }).wines[0].price,
    1000,
  );
  for (const price of [1001, 5000, 10000]) {
    const before = structuredClone(s);
    assert.throws(
      () => act(s, { type: 'price', id: s.wines[0].id, price }),
      /Bottle a 98\+ point wine/,
    );
    assert.deepEqual(s, before);
  }
  // A scored reserve is not yet a bottled release, and a failed bottling earns nothing.
  const noKits = { ...s, kits: 0 };
  const before = structuredClone(noKits);
  assert.throws(() => bottle(noKits, 98), /kits/);
  assert.deepEqual(noKits, before);
  assert.equal(bottlePriceLimit(noKits), 1000);
});

test('the first actual 98-point bottling unlocks all releases and announces it once', () => {
  const before = bottle(prepared(), 97);
  let s = bottle(before, 98);
  assert.equal(before.stats.best, 97);
  assert.equal(s.stats.best, 98);
  assert.equal(bottlePriceLimit(s), 10000);
  assert.ok(s.wines.at(-1)!.price > 1000); // The milestone bottle gets its full suggestion immediately.
  assert.match(s.log[0].text, /Collector pricing unlocked/);
  s = act(s, { type: 'price', id: s.wines[0].id, price: 1001 });
  s = act(s, { type: 'price', id: s.wines[1].id, price: 10000 });
  assert.equal(s.wines[0].price, 1001); // Estate-wide unlock, not only the qualifying wine.
  assert.equal(s.wines[1].price, 10000);
  s = bottle(s, 98);
  assert.doesNotMatch(s.log[0].text, /Collector pricing unlocked/);
  assert.equal(
    s.log.filter((x) => x.text.includes('Collector pricing unlocked')).length,
    1,
  );
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('keeping or selling the qualifying bottle and making a lower-scoring release never relocks pricing', () => {
  let s = bottle(prepared(), 98);
  const id = s.wines[0].id;
  s = act(s, { type: 'collectWine', id, bottles: 1 });
  s = deserialize(serialize(s));
  assert.equal(bottlePriceLimit(s), 10000);
  s = act(s, { type: 'returnWine', id, bottles: 1 });
  s = act(s, { type: 'wholesale', id });
  s = bottle(s, 75);
  assert.equal(s.wines[0].bottles, 0);
  assert.equal(s.stats.best, 98);
  assert.equal(bottlePriceLimit(deserialize(serialize(s))), 10000);
  assert.doesNotMatch(s.log[0].text, /Collector pricing unlocked/);
});

test('older high prices respect the lifetime record on import and a hot update without changing accounts', () => {
  const old = bottle(prepared(), 97);
  old.wines[0].price = 5000;
  const before = structuredClone(old);
  const expected = structuredClone(old);
  expected.wines[0].price = 1000;
  assert.deepEqual(deserialize(serialize(old)), expected);
  const hot = act(old, {
    type: 'label',
    id: old.wines[0].id,
    name: old.wines[0].label,
  });
  assert.equal(hot.wines[0].price, 1000);
  assert.equal(hot.cash, old.cash);
  assert.deepEqual(hot.finance, old.finance);
  assert.deepEqual(hot.wines[0].accounts, old.wines[0].accounts);
  assert.deepEqual(old, before);

  // stats.best outlives individual releases and history compaction.
  const qualified = { ...old, stats: { ...old.stats, best: 98 } };
  assert.deepEqual(deserialize(serialize(qualified)), qualified);
  assert.equal(bottlePriceLimit(qualified), 10000);
});
