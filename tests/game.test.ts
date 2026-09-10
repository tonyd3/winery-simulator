import { learn, allGrapes } from './helpers.ts';
import { bottleBatch } from './helpers.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  calendar,
  demand,
  deserialize,
  fairPrice,
  grapeLiters,
  newGame,
  quality,
  readyToHarvest,
  serialize,
  stateSchema,
  tankCount,
  occupiedTankCount,
  upkeep,
} from '../src/game.ts';
import type { Action, GameState } from '../src/game.ts';

function tick(state: GameState, weeks = 1) {
  for (let i = 0; i < weeks; i++) state = act(state, { type: 'advance' });
  return state;
}
function ferment(oak = false) {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  return act(s, { type: 'ferment', id: s.grapes[0].id, oak });
}
function bottle() {
  let s = tick(ferment(), 2);
  return bottleBatch(s, s.batches[0].id);
}

test('complete harvest to retail loop conserves liquid, bottles and cash', () => {
  let s = newGame();
  s = act(s, { type: 'tend', id: 1 });
  s = act(s, { type: 'harvest', id: 1 });
  assert.equal(s.grapes[0].kg, 360);
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  assert.equal(s.batches[0].liters, 252);
  s = tick(s, 2);
  s = bottleBatch(s, s.batches[0].id);
  assert.equal(s.wines[0].bottles, 336);
  assert.equal(s.kits, 264);
  assert.equal(s.batches.length, 0);
  s = act(s, { type: 'list', id: s.wines[0].id });
  const before = s;
  const expected = demand(s.wines[0], s);
  s = tick(s);
  assert.equal(s.wines[0].bottles, before.wines[0].bottles - expected);
  assert.equal(
    s.cash,
    before.cash + expected * before.wines[0].price - upkeep(before),
  );
  assert.equal(s.stats.sold, expected);
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('actions are immutable and failed purchases cannot charge money', () => {
  const s = newGame();
  const copy = structuredClone(s);
  act(s, { type: 'harvest', id: 1 });
  assert.deepEqual(s, copy);
  s.cash = 1;
  assert.throws(() => act(s, { type: 'buyPlot', id: 4 }), /more/);
  assert.equal(s.cash, 1);
  assert.equal(s.plots[3].owned, false);
});
test('harvest requires ripeness and only happens once per year', () => {
  assert.throws(() => act(newGame(), { type: 'harvest', id: 2 }), /80%/);
  const s = act(newGame(), { type: 'harvest', id: 1 });
  assert.throws(() => act(s, { type: 'harvest', id: 1 }), /80%/);
  assert.equal(readyToHarvest(tick(s).plots[0], 7), false);
});
test('winter loses unpicked fruit and spring restarts the next vintage', () => {
  const s = tick(newGame(), 4);
  assert.equal(calendar(s.week).season, 'Winter');
  assert.equal(s.plots[0].growth, 0);
  assert.ok(s.log.some((l) => l.text.includes('Unpicked fruit')));
  const spring = tick(s, 3);
  assert.equal(calendar(spring.week).year, 2);
  assert.equal(calendar(spring.week).season, 'Spring');
  assert.ok(spring.plots[0].growth > 0);
});
test('fresh grapes expire after exactly three weeks', () => {
  const s = act(newGame(), { type: 'harvest', id: 1 });
  assert.equal(tick(s, 2).grapes.length, 1);
  assert.equal(tick(s, 3).grapes.length, 0);
});
test('occupied tanks require a separate tank purchase, and floor expansion alone cannot process fruit', () => {
  let s = tick(ferment(), 2);
  assert.equal(occupiedTankCount(s), 2);
  s = act(s, { type: 'harvest', id: 2 });
  const id = s.grapes[0].id;
  assert.throws(
    () => act(s, { type: 'ferment', id, oak: false }),
    /empty tanks/,
  );
  s = act(s, { type: 'expandCellar' });
  assert.equal(tankCount(s), 2);
  assert.throws(
    () => act(s, { type: 'ferment', id, oak: false }),
    /empty tanks/,
  );
  s = act(s, { type: 'buyTank', count: 2 });
  assert.equal(tankCount(s), 4);
  s = act(s, { type: 'ferment', id, oak: false });
  assert.equal(occupiedTankCount(s), 4);
  assert.equal(s.batches.length, 2);
});
test('unfinished wine cannot be bottled; legacy oak aging still stops at eight weeks', () => {
  let s = ferment(true);
  s.batches[0].agingProfile = 'balanced';
  delete s.batches[0].maturationProfile;
  assert.throws(() => bottleBatch(s, s.batches[0].id), /finish/);
  s = tick(s, 2);
  s = act(s, { type: 'age', id: s.batches[0].id });
  const q = quality(s.batches[0]);
  s = tick(s, 8);
  assert.equal(s.batches[0].age, 8);
  assert.ok(quality(s.batches[0]) > q);
  const q8 = quality(s.batches[0]);
  s = tick(s, 10);
  assert.equal(s.batches[0].age, 8);
  assert.equal(quality(s.batches[0]), q8);
});
test('bottling requires supplies and deliveries take one week', () => {
  let s = tick(ferment(), 2);
  s.kits = 0;
  assert.throws(() => bottleBatch(s, s.batches[0].id), /kits/);
  s = act(s, { type: 'supplies' });
  assert.equal(s.kits, 0);
  s = tick(s);
  assert.equal(s.kits, 600);
  assert.equal(s.deliveries.length, 0);
  assert.ok(bottleBatch(s, s.batches[0].id).kits < 600);
});
test('pricing affects demand; unlisted bottles do not sell; wholesale cannot double sell', () => {
  let s = bottle();
  const w = s.wines[0];
  assert.equal(demand(w, s), 0);
  assert.ok(
    demand({ ...w, listed: true, price: 10 }, s) >
      demand({ ...w, listed: true, price: 40 }, s),
  );
  assert.equal(tick(s).wines[0].bottles, w.bottles);
  const value = w.bottles * Math.round(fairPrice(w, s.reputation) * 0.6);
  const cash = s.cash;
  s = act(s, { type: 'wholesale', id: w.id });
  assert.equal(s.cash, cash + value);
  assert.equal(s.wines[0].bottles, 0);
  assert.throws(() => act(s, { type: 'wholesale', id: w.id }), /sold out/);
});
test('expanded bottle prices survive saves and reject invalid changes without side effects', () => {
  const before = bottle();
  const copy = structuredClone(before);
  for (const price of [1, 5, 6, 50, 75, 250, 1000, 1001, 5000, 10_000]) {
    const changed = act(before, {
      type: 'price',
      id: before.wines[0].id,
      price,
    });
    assert.equal(changed.wines[0].price, price);
    assert.equal(changed.cash, before.cash);
    assert.equal(changed.week, before.week);
    assert.equal(changed.wines[0].bottles, before.wines[0].bottles);
    assert.deepEqual(deserialize(serialize(changed)), changed);
  }
  for (const price of [0, -1, 10_001, 999.5, 9999.5, NaN, Infinity]) {
    assert.throws(
      () => act(before, { type: 'price', id: before.wines[0].id, price }),
      /whole-dollar price/,
    );
    const malformed = structuredClone(before);
    malformed.wines[0].price = price;
    assert.equal(stateSchema.safeParse(malformed).success, false);
  }
  assert.deepEqual(before, copy);
});
test('wide pricing keeps demand bounded and weekly sales use the chosen amount', () => {
  let base = bottle();
  base = act(base, { type: 'list', id: base.wines[0].id });
  const prices = [1, 5, 25, 50, 75, 250, 1000, 5000, 10_000];
  let previousDemand = base.wines[0].bottles;
  for (const price of prices) {
    const s = act(base, { type: 'price', id: base.wines[0].id, price });
    const expected = demand(s.wines[0], s);
    assert.ok(expected >= 0 && expected <= previousDemand);
    assert.ok(expected <= s.wines[0].bottles);
    const next = tick(s);
    assert.equal(next.wines[0].bottles, s.wines[0].bottles - expected);
    assert.equal(next.cash, s.cash + expected * price - upkeep(s));
    assert.equal(next.stats.sold, s.stats.sold + expected);
    previousDemand = expected;
  }
  assert.equal(previousDemand, 0);
});
test('99-point wines can earn retail revenue above $1,000 at high Prestige', () => {
  let s = bottle();
  s.reputation = 4000;
  s.wines[0].quality = 99;
  const price = fairPrice(s.wines[0], s.reputation);
  assert.ok(price > 1000);
  s = act(s, { type: 'price', id: s.wines[0].id, price });
  s = act(s, { type: 'list', id: s.wines[0].id });
  const expected = demand(s.wines[0], s);
  assert.ok(expected > 0);
  const next = tick(s);
  assert.equal(next.wines[0].bottles, s.wines[0].bottles - expected);
  assert.equal(next.cash, s.cash + expected * price - upkeep(s));
  assert.deepEqual(deserialize(serialize(next)), next);
});
test('tending cannot be repeated in the same week', () => {
  const s = act(newGame(), { type: 'tend', id: 1 });
  assert.throws(() => act(s, { type: 'tend', id: 1 }), /already/);
});
test('matching soil improves harvest quality', () => {
  const s = newGame();
  const matched = act(s, { type: 'harvest', id: 1 }).grapes[0].quality;
  // Hold climate, grape traits, and health constant; only change the parcel soil.
  s.plots[1] = { ...s.plots[0], id: 2 };
  assert.equal(
    act(s, { type: 'harvest', id: 2 }).grapes[0].quality,
    matched - 8,
  );
});
test('builds and land purchases cannot be duplicated; upgrades affect production', () => {
  const start = learn(allGrapes(newGame()), 'cellar_control');
  start.cash = 30000; // Fund this production test's land and planting setup.
  let s = act(start, {
    type: 'buyPlot',
    id: 4,
  });
  assert.throws(() => act(s, { type: 'buyPlot', id: 4 }), /already/);
  s = act(s, { type: 'plant', id: 4, variety: 'pinot' });
  assert.throws(
    () => act(s, { type: 'plant', id: 4, variety: 'merlot' }),
    /empty/,
  );
  s.cash = 100000; // Fund the bench and subsequent harvest/fermentation.
  s = act(s, { type: 'upgrade', upgrade: 'lab' });
  assert.throws(() => act(s, { type: 'upgrade', upgrade: 'lab' }), /already/);
  s = act(s, { type: 'harvest', id: 1 });
  const qualityBefore = s.grapes[0].quality;
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  assert.equal(s.batches[0].quality, Math.min(100, qualityBefore + 3));
});
test('save importer rejects malformed, incompatible and unsafe nested state', () => {
  assert.throws(() => deserialize('{bad'), /valid JSON/);
  const initial = newGame();
  for (const change of [
    (s: any) => (s.version = 9),
    (s: any) => (s.cash = -100),
    (s: any) => (s.plots[0].id = 2),
    (s: any) => (s.plots[0].variety = 'poison'),
    (s: any) => (s.log = []),
    (s: any) => (s.upgrades = ['tasting', 'tasting']),
    (s: any) => (s.extra = true),
  ]) {
    const s = structuredClone(initial);
    change(s);
    assert.throws(() => deserialize(serialize(s)), /compatible/);
  }
  const badBatch = ferment();
  badBatch.batches[0].remaining = 0;
  assert.throws(() => deserialize(serialize(badBatch)), /compatible/);
  assert.deepEqual(initial, newGame());
});
test('save roundtrip preserves deterministic subsequent weather and outcomes', () => {
  const state = ferment();
  const loaded = deserialize(serialize(state));
  assert.deepEqual(tick(state, 12), tick(loaded, 12));
});
test('extreme overhead and empty funds recover without invalid negative balance', () => {
  let s = newGame();
  s.cash = 0;
  s.upgrades = ['irrigation', 'cellar', 'lab'];
  s.plots.forEach((p) => (p.owned = true));
  s = tick(s);
  assert.ok(s.cash >= 0);
  assert.ok(stateSchema.safeParse(s).success);
});
test('100 years of funded growth remains serializable', () => {
  const initial = newGame();
  initial.cash = 1000000;
  const s = tick(initial, 1200);
  assert.ok(s.cash >= 0);
  assert.equal(s.log.length, 40);
  assert.equal(s.ledger.length, 80);
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('new games omit financial support and reject retired actions without mutation', () => {
  const s = newGame();
  assert.equal(Object.hasOwn(s, 'helpWeek'), false);
  assert.equal(Object.hasOwn(s, 'debt'), false);
  assert.deepEqual(deserialize(serialize(s)), s);
  const before = structuredClone(s);
  for (const type of ['work', 'loan', 'repay']) {
    assert.throws(() => act(s, { type } as Action), /Unknown game action/);
    assert.deepEqual(s, before);
  }
});
test('legacy financial support preserves cash and history without ongoing interest', () => {
  const legacy = newGame();
  legacy.debt = 3000;
  legacy.helpWeek = legacy.week;
  legacy.cash += 3250;
  legacy.ledger.unshift(
    { week: legacy.week, label: 'Neighboring vineyard work', amount: 250 },
    { week: legacy.week, label: 'Small business loan', amount: 3000 },
  );
  for (const version of [5, 6]) {
    const loaded = deserialize(serialize({ ...legacy, version } as GameState));
    assert.equal(loaded.cash, legacy.cash);
    assert.deepEqual(loaded.ledger, legacy.ledger);
    assert.deepEqual(deserialize(serialize(loaded)), loaded);
    const current = structuredClone(loaded);
    delete current.debt;
    delete current.helpWeek;
    assert.equal(upkeep(loaded), upkeep(current));
    const next = tick(loaded, 12);
    assert.equal(next.debt, 3000);
    assert.equal(next.helpWeek, legacy.helpWeek);
    delete next.debt;
    delete next.helpWeek;
    assert.deepEqual(next, tick(current, 12));
    assert.deepEqual(deserialize(serialize(next)), next);
  }
});
test('volume conversion does not lose a liter to floating point multiplication', () => {
  assert.equal(grapeLiters(360), 252);
  assert.equal(grapeLiters(340), 238);
  assert.equal(grapeLiters(280), 196);
});

test('new estates save production progress without achievement tracking', () => {
  let s = newGame();
  assert.equal(Object.hasOwn(s, 'claimed'), false);
  assert.deepEqual(deserialize(serialize(s)), s);
  s = act(s, { type: 'harvest', id: 1 });
  assert.equal(s.stats.harvested, s.grapes[0].kg);
  assert.equal(s.cash, 12500 - 180);
  assert.equal(s.stats.revenue, 0);
  assert.equal(s.ledger.length, 2);
  assert.equal(s.ledger[0].amount, -180);
  const loaded = deserialize(serialize(s));
  assert.deepEqual(loaded, s);
  assert.equal(Object.hasOwn(loaded, 'claimed'), false);
  const before = structuredClone(s);
  assert.throws(
    () => act(s, { type: 'claim', id: 'harvest' } as unknown as Action),
    /Unknown game action/,
  );
  assert.deepEqual(s, before);
});

test('legacy achievement metadata and payouts survive loading without affecting gameplay', () => {
  const legacy = newGame();
  legacy.claimed = ['harvest'];
  legacy.cash += 350;
  legacy.ledger.unshift({
    week: legacy.week,
    label: 'From the vine milestone',
    amount: 350,
  });
  const loaded = deserialize(serialize(legacy));
  assert.deepEqual(loaded, legacy);
  const withoutAchievements = structuredClone(loaded);
  delete withoutAchievements.claimed;
  const harvested = act(loaded, { type: 'harvest', id: 1 });
  const untracked = act(withoutAchievements, { type: 'harvest', id: 1 });
  assert.deepEqual(harvested, { ...untracked, claimed: ['harvest'] });
  assert.equal(harvested.cash, legacy.cash - 180);
  assert.deepEqual(harvested.ledger.slice(1), legacy.ledger);
  assert.deepEqual(deserialize(serialize(harvested)), harvested);

  const older = JSON.parse(serialize(legacy));
  older.state.version = 5;
  delete older.state.grapeLicenses;
  const migrated = deserialize(JSON.stringify(older));
  assert.deepEqual(migrated.claimed, legacy.claimed);
  assert.deepEqual(migrated.ledger, legacy.ledger);
  assert.equal(migrated.cash, legacy.cash);
});

test('legacy fermentation starts maturation automatically and reserves stop the clock', () => {
  let s = ferment();
  s.batches[0].agingProfile = 'balanced';
  delete s.batches[0].maturationProfile;
  s = tick(s, 2);
  assert.equal(s.batches[0].stage, 'aging');
  assert.equal(s.batches[0].age, 0);
  s = tick(s, 3);
  assert.equal(s.batches[0].age, 3);
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  const parts = structuredClone(s.reserves[0].components);
  assert.equal(parts[0].maturation?.weeks, 3);
  s = tick(s, 4);
  assert.deepEqual(s.reserves[0].components, parts);
});

test('old ready batches start maturing on the next week without retroactive aging', () => {
  let s = tick(ferment(), 2);
  delete s.batches[0].maturationProfile;
  s.batches[0].agingProfile = 'balanced';
  s.batches[0].stage = 'ready';
  s = deserialize(serialize(s));
  assert.equal(s.batches[0].age, 0);
  s = tick(s);
  assert.equal(s.batches[0].stage, 'aging');
  assert.equal(s.batches[0].age, 1);
});
