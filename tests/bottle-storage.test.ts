import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  deserialize,
  serialize,
  stateSchema,
  weeklySales,
  demandForecast,
  demand,
  upkeep,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { DEFAULT_DESIGN, volume } from '../src/winemaking.ts';
import {
  BOTTLE_STORAGE,
  bottlesStored,
  shelfStock,
  shelvesUsed,
  shelfRoom,
  storageCapacity,
  warehouseRoom,
  storageExpansionCost,
} from '../src/bottleStorage.ts';

function reserves() {
  const s = newGame();
  s.reserves.push({
    id: s.nextId++,
    name: 'Storage trial',
    stored: s.week,
    score: 82,
    components: [{ variety: 'merlot', year: 1, quality: 82, ml: 1500000 }],
  });
  s.kits = 2000;
  return s;
}
function bottle(s: GameState, count: number) {
  return act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: count,
    line: s.lines.length
      ? { id: s.lines[0].id }
      : { name: 'Storage trial', design: DEFAULT_DESIGN },
  });
}
const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);

test('warehouse counts every unsold bottle across releases and blocks excess bottling atomically', () => {
  let s = bottle(reserves(), 580);
  s = act(s, { type: 'list', id: s.wines[0].id, bottles: 120 });
  assert.equal(bottlesStored(s), 580);
  assert.equal(warehouseRoom(s), 20);
  const before = structuredClone(s);
  assert.throws(() => bottle(s, 21), /warehouse has room for 20/);
  assert.deepEqual(s, before);
  s = bottle(s, 20);
  assert.equal(warehouseRoom(s), 0);
  assert.equal(volume(s.reserves[0].components), 1050000);
  assert.equal(s.kits, 1400);
  assert.throws(() => bottle(s, 1), /warehouse has room for 0/);
  valid(s);
});

test('warehouse and shelf expansions are independent paid investments and survive reload', () => {
  let s = reserves();
  for (const kind of ['warehouse', 'shelves'] as const) {
    const before = structuredClone(s),
      cost = storageExpansionCost(s, kind);
    s = act(s, { type: 'expandBottleStorage', kind });
    assert.equal(s.cash, before.cash - cost);
    assert.equal(
      s.finance!.totals.investment,
      before.finance!.totals.investment + cost * 100,
    );
    assert.equal(
      storageCapacity(s, kind),
      storageCapacity(before, kind) + BOTTLE_STORAGE[kind].step,
    );
    assert.equal(
      storageExpansionCost(s, kind),
      cost + BOTTLE_STORAGE[kind].costStep,
    );
    assert.equal(upkeep(s), upkeep(before));
  }
  s = bottle(s, 1000);
  assert.equal(warehouseRoom(s), 200);
  assert.equal(storageCapacity(s, 'shelves'), 180);
  valid(s);
});

test('unaffordable and fully expanded storage reject purchases without spending', () => {
  for (const kind of ['warehouse', 'shelves'] as const) {
    const s = newGame();
    s.cash = 0;
    const before = structuredClone(s);
    assert.throws(() => act(s, { type: 'expandBottleStorage', kind }), /more/);
    assert.deepEqual(s, before);
    s.cash = 1e9;
    s.bottleStorage[kind] = BOTTLE_STORAGE[kind].maxExpansions;
    const full = structuredClone(s);
    assert.throws(
      () => act(s, { type: 'expandBottleStorage', kind }),
      /maximum capacity/,
    );
    assert.deepEqual(s, full);
    valid(s);
  }
});

test('listings share shelves, allocations can change, and pausing returns space without losing stock', () => {
  let s = bottle(bottle(reserves(), 300), 200);
  const [a, b] = s.wines.map((w) => w.id);
  s = act(s, { type: 'list', id: a, bottles: 100 });
  assert.equal(shelfRoom(s), 20);
  assert.throws(
    () => act(s, { type: 'list', id: b, bottles: 21 }),
    /Free space/,
  );
  s = act(s, { type: 'list', id: b, bottles: 20 });
  assert.equal(shelvesUsed(s), 120);
  assert.throws(
    () => act(s, { type: 'shelfSpace', id: b, bottles: 21 }),
    /Reduce another/,
  );
  s = act(s, { type: 'shelfSpace', id: a, bottles: 80 });
  s = act(s, { type: 'shelfSpace', id: b, bottles: 40 });
  s = act(s, { type: 'list', id: a });
  assert.equal(shelfRoom(s), 80);
  assert.equal(bottlesStored(s), 500);
  assert.equal(s.wines[0].shelfSpace, 0);
  s = act(s, { type: 'list', id: a, bottles: 80 });
  valid(s);
});

test('invalid shelf counts and sold-out releases cannot be listed or consume space', () => {
  const s = bottle(reserves(), 30),
    id = s.wines[0].id;
  for (const bottles of [0, -1, 1.5, NaN, Infinity, 31, 121]) {
    const before = structuredClone(s);
    assert.throws(() => act(s, { type: 'list', id, bottles }));
    assert.deepEqual(s, before);
  }
  const sold = act(s, { type: 'wholesale', id });
  assert.throws(() => act(sold, { type: 'list', id }), /sold out/);
  assert.equal(shelvesUsed(sold), 0);
});

test('weekly retail sales stop at each shelf allocation and replenish next week with exact accounts', () => {
  let s = bottle(bottle(reserves(), 200), 200);
  s.reputation = 50000;
  for (const w of s.wines) {
    s = act(s, { type: 'price', id: w.id, price: 1 });
    s = act(s, { type: 'list', id: w.id, bottles: 7 });
  }
  for (let i = 0; i < 3; i++) {
    const before = s;
    for (const w of s.wines) {
      assert.equal(weeklySales(s).get(w.id), 7);
      assert.equal(demandForecast(w, s).high, 7);
    }
    s = act(deserialize(serialize(s)), { type: 'advance' });
    assert.equal(before.wines[0].bottles - s.wines[0].bottles, 7);
    assert.equal(before.wines[1].bottles - s.wines[1].bottles, 7);
    assert.equal(s.stats.sold - before.stats.sold, 14);
    assert.equal(s.cash, before.cash + 14 - upkeep(before));
    assert.equal(shelvesUsed(s), 14);
    assert.equal(s.wines[0].accounts!.sold, 7 * (i + 1));
    valid(s);
  }
});

test('last retail bottles and wholesale release both warehouse and shelf capacity', () => {
  let s = bottle(bottle(reserves(), 10), 200);
  s.reputation = 50000;
  s = act(s, { type: 'list', id: s.wines[0].id, bottles: 10 });
  s = act(s, { type: 'price', id: s.wines[0].id, price: 1 });
  s = act(s, { type: 'list', id: s.wines[1].id, bottles: 100 });
  s = act(s, { type: 'price', id: s.wines[1].id, price: 1000 });
  s = act(s, { type: 'advance' });
  assert.equal(shelfStock(s.wines[0]), 0);
  const before = bottlesStored(s);
  s = act(s, { type: 'wholesale', id: s.wines[1].id });
  assert.ok(before > 120);
  assert.equal(bottlesStored(s), 0);
  assert.equal(shelvesUsed(s), 0);
  assert.equal(warehouseRoom(s), 600);
  assert.throws(
    () => act(s, { type: 'wholesale', id: s.wines[1].id }),
    /sold out/,
  );
  valid(s);
});

test('legacy saves retain excess bottles, scores, prices and listings with bounded shelf allocations', () => {
  let s = reserves();
  s.bottleStorage.warehouse = 2;
  s = bottle(bottle(s, 800), 200);
  const raw = JSON.parse(serialize(s));
  delete raw.state.bottleStorage;
  for (const w of raw.state.wines) {
    delete w.shelfSpace;
    w.listed = true;
  }
  const loaded = deserialize(JSON.stringify(raw));
  assert.equal(bottlesStored(loaded), 1000);
  assert.equal(warehouseRoom(loaded), 0);
  assert.equal(shelvesUsed(loaded), 120);
  assert.deepEqual(
    loaded.wines.map((w) => [w.bottles, w.price, w.quality, w.listed]),
    s.wines.map((w) => [w.bottles, w.price, w.quality, true]),
  );
  assert.throws(() => bottle(loaded, 1), /warehouse/);
  valid(loaded);
  const afterSale = act(loaded, { type: 'wholesale', id: loaded.wines[0].id });
  assert.equal(warehouseRoom(afterSale), 400);
});

test('save validation rejects corrupt capacities and shelf overbooking while permitting legacy warehouse overflow', () => {
  let s = bottle(bottle(reserves(), 200), 200);
  for (const kind of ['warehouse', 'shelves'] as const) {
    for (const value of [
      -1,
      0.5,
      Infinity,
      BOTTLE_STORAGE[kind].maxExpansions + 1,
    ]) {
      const bad = structuredClone(s);
      bad.bottleStorage[kind] = value;
      assert.equal(stateSchema.safeParse(bad).success, false);
    }
  }
  s.wines.forEach((w) => {
    w.listed = true;
    w.shelfSpace = 61;
  });
  assert.equal(stateSchema.safeParse(s).success, false);
  s.wines[1].shelfSpace = 59;
  valid(s);
  s.wines[0].shelfSpace = -1;
  assert.equal(stateSchema.safeParse(s).success, false);
});

test('forecasts respect crowded shelves, counterfactual listings, promotions and paused listings', () => {
  let s = bottle(bottle(reserves(), 200), 200);
  const [a, b] = s.wines.map((w) => w.id);
  s = act(s, { type: 'list', id: a, bottles: 120 });
  const waiting = { ...s.wines[1], listed: true };
  assert.equal(demandForecast(waiting, s).high, 0);
  assert.equal(demand(waiting, s), 0);
  s = act(s, { type: 'shelfSpace', id: a, bottles: 115 });
  assert.ok(demandForecast(waiting, s).high <= 5);
  s = act(s, { type: 'list', id: b, bottles: 5 });
  for (let week = 6; week < 60; week++) {
    const future = { ...s, week };
    for (const w of future.wines) {
      for (const price of [1, 27, 1000]) {
        const offered = { ...w, price, marketingWeeks: 4 };
        const range = demandForecast(offered, future),
          count = demand(offered, future);
        assert.ok(count >= range.low && count <= range.high);
        assert.ok(range.high <= shelfStock(w));
      }
    }
  }
  s = act(s, { type: 'list', id: b });
  assert.equal(demand(s.wines[1], s), 0);
});
