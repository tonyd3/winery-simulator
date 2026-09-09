import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  stateSchema,
  wineSales,
  demand,
  demandForecast,
  weeklySales,
  wholesalePrice,
  upkeep,
} from '../src/game.ts';
import { DEFAULT_DESIGN } from '../src/winemaking.ts';
import {
  bottlesStored,
  privateStock,
  saleStock,
  shelfStock,
  shelvesUsed,
  warehouseRoom,
} from '../src/bottleStorage.ts';
import { releaseResult } from '../src/finance.ts';

function stocked(bottles = 100) {
  const s = newGame();
  s.kits = 1000;
  s.reserves.push({
    id: s.nextId++,
    name: 'First vintage',
    stored: s.week,
    score: 84,
    components: [
      {
        variety: 'merlot',
        year: 1,
        quality: 84,
        ml: 600000,
        directCostCents: 40000,
      },
    ],
  });
  return act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles,
    line: {
      name: 'First vintage',
      design: { ...DEFAULT_DESIGN, note: 'For our table.' },
    },
  });
}

test('keeping and returning conserve bottles, money, accounts and release identity across saves', () => {
  const before = stocked(),
    id = before.wines[0].id;
  let s = act(before, { type: 'collectWine', id, bottles: 12 });
  assert.equal(privateStock(s.wines[0]), 12);
  assert.equal(saleStock(s.wines[0]), 88);
  assert.equal(bottlesStored(s), 100);
  assert.equal(warehouseRoom(s), warehouseRoom(before));
  assert.equal(upkeep(s), upkeep(before));
  assert.equal(s.cash, before.cash);
  assert.deepEqual(s.stats, before.stats);
  assert.deepEqual(s.finance, before.finance);
  assert.deepEqual(releaseResult(s.wines[0]), releaseResult(before.wines[0]));
  assert.equal(wineSales(s.wines).count, 0);
  assert.deepEqual(
    { ...s.wines[0], privateBottles: undefined },
    { ...before.wines[0], privateBottles: undefined },
  );
  assert.deepEqual(deserialize(serialize(s)), s);
  s = act(deserialize(serialize(s)), { type: 'returnWine', id, bottles: 5 });
  assert.equal(privateStock(s.wines[0]), 7);
  assert.equal(saleStock(s.wines[0]), 93);
  s = act(s, { type: 'returnWine', id, bottles: 7 });
  assert.equal(privateStock(s.wines[0]), 0);
  assert.equal(saleStock(s.wines[0]), 100);
  assert.equal(s.wines[0].listed, false);
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('keeping bottles trims shelves, all-private releases cannot be listed, and returning never relists', () => {
  let s = stocked(),
    id = s.wines[0].id;
  s = act(s, { type: 'list', id, bottles: 80 });
  s = act(s, { type: 'collectWine', id, bottles: 30 });
  assert.equal(s.wines[0].shelfSpace, 70);
  assert.equal(shelvesUsed(s), 70);
  assert.throws(() => act(s, { type: 'shelfSpace', id, bottles: 71 }));
  s = act(s, { type: 'returnWine', id, bottles: 10 });
  assert.equal(s.wines[0].shelfSpace, 70);
  s = act(s, { type: 'collectWine', id, bottles: 80 });
  assert.equal(privateStock(s.wines[0]), 100);
  assert.equal(s.wines[0].listed, false);
  assert.equal(s.wines[0].shelfSpace, 0);
  assert.equal(shelvesUsed(s), 0);
  assert.throws(() => act(s, { type: 'list', id }), /Private Collection/);
  assert.throws(() => act(s, { type: 'marketWine', id }), /Private Collection/);
  s = act(s, { type: 'returnWine', id, bottles: 2 });
  assert.equal(s.wines[0].listed, false);
  assert.equal(shelfStock(s.wines[0]), 0);
  assert.throws(() => act(s, { type: 'list', id, bottles: 3 }));
  s = act(s, { type: 'list', id, bottles: 2 });
  assert.equal(shelfStock(s.wines[0]), 2);
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('weekly retail exhausts only selling stock and preserves the collection over time', () => {
  let s = stocked(30),
    id = s.wines[0].id;
  s.reputation = 50000;
  s = act(s, { type: 'price', id, price: 1 });
  s = act(s, { type: 'list', id, bottles: 30 });
  s = act(s, { type: 'collectWine', id, bottles: 12 });
  assert.equal(demand(s.wines[0], s), 18);
  const before = s;
  s = act(s, { type: 'advance' });
  assert.equal(s.cash, before.cash + 18 - upkeep(before));
  assert.equal(s.stats.sold, 18);
  assert.equal(s.wines[0].accounts!.sold, 18);
  assert.equal(s.wines[0].listed, false);
  assert.equal(s.wines[0].bottles, 12);
  assert.equal(saleStock(s.wines[0]), 0);
  const remaining = structuredClone(s.wines[0]);
  for (let i = 0; i < 12; i++)
    s = act(deserialize(serialize(s)), { type: 'advance' });
  assert.deepEqual(s.wines[0], remaining);
  assert.equal(demand(s.wines[0], s), 0);
  assert.equal(demandForecast({ ...s.wines[0], listed: true }, s).high, 0);
  assert.equal(bottlesStored(s), 12);
});

test('wholesale leaves private stock and only accounts for bottles actually sold, including legacy releases', () => {
  for (const legacy of [false, true]) {
    let s = stocked(),
      id = s.wines[0].id;
    if (legacy) s.wines[0].produced = null;
    s = act(s, { type: 'list', id, bottles: 60 });
    s = act(s, { type: 'collectWine', id, bottles: 12 });
    const revenue = 88 * wholesalePrice(s.wines[0], s.reputation, s);
    const before = s;
    s = act(s, { type: 'wholesale', id });
    assert.equal(s.cash, before.cash + revenue);
    assert.equal(s.stats.sold, 88);
    assert.equal(s.stats.revenue - before.stats.revenue, revenue);
    assert.equal(s.wines[0].accounts!.revenueCents, revenue * 100);
    assert.equal(wineSales(s.wines).count, 88);
    assert.equal(s.wines[0].bottles, 12);
    assert.equal(privateStock(s.wines[0]), 12);
    assert.equal(shelvesUsed(s), 0);
    assert.equal(s.wines[0].listed, false);
    assert.throws(
      () => act(s, { type: 'wholesale', id }),
      /Private Collection/,
    );
    s = act(s, { type: 'returnWine', id, bottles: 2 });
    s = act(s, { type: 'wholesale', id });
    assert.equal(wineSales(s.wines).count, 90);
    assert.equal(s.wines[0].bottles, 10);
    assert.equal(privateStock(s.wines[0]), 10);
    assert.deepEqual(deserialize(serialize(s)), s);
  }
});

test('private bottles neither inflate nor dilute shared customer demand and forecasts', () => {
  let s = stocked(),
    id = s.wines[0].id;
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 60,
    line: { id: s.lines[0].id },
  });
  for (const w of s.wines) s = act(s, { type: 'list', id: w.id, bottles: 50 });
  s = act(s, { type: 'collectWine', id, bottles: 80 });
  const equivalent = structuredClone(s);
  equivalent.wines[0].bottles = 20;
  equivalent.wines[0].privateBottles = 0;
  assert.deepEqual(weeklySales(s), weeklySales(equivalent));
  for (const [i, wine] of s.wines.entries()) {
    assert.deepEqual(
      demandForecast(wine, s),
      demandForecast(equivalent.wines[i], equivalent),
    );
  }
});

test('invalid transfers reject atomically and kept bottles cannot bypass warehouse capacity', () => {
  let s = stocked(600),
    id = s.wines[0].id;
  s = act(s, { type: 'collectWine', id, bottles: 600 });
  assert.equal(warehouseRoom(s), 0);
  assert.throws(
    () =>
      act(s, {
        type: 'bottle',
        id: s.reserves[0].id,
        bottles: 1,
        line: { id: s.lines[0].id },
      }),
    /warehouse has room for 0/,
  );
  s = act(s, { type: 'returnWine', id, bottles: 300 });
  for (const type of ['collectWine', 'returnWine'] as const) {
    for (const bottles of [0, -1, 1.5, NaN, Infinity, 301]) {
      const before = structuredClone(s);
      assert.throws(() => act(s, { type, id, bottles }));
      assert.deepEqual(s, before);
    }
    assert.throws(() => act(s, { type, id: -1, bottles: 1 }));
  }
});

test('old saves have no kept bottles; corrupt collection quantities are rejected on import', () => {
  const s = stocked();
  const raw = JSON.parse(serialize(s));
  delete raw.state.wines[0].privateBottles;
  const loaded = deserialize(JSON.stringify(raw));
  assert.equal(privateStock(loaded.wines[0]), 0);
  assert.equal(saleStock(loaded.wines[0]), 100);
  for (const invalid of [-1, 1.5, 101]) {
    raw.state.wines[0].privateBottles = invalid;
    assert.equal(stateSchema.safeParse(raw.state).success, false);
    assert.throws(() => deserialize(JSON.stringify(raw)));
  }
});
