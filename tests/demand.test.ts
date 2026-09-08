import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  demand,
  demandForecast,
  deserialize,
  fairPrice,
  newGame,
  serialize,
  stateSchema,
  upkeep,
  wholesalePrice,
} from '../src/game.ts';
import { bottleBatch } from './helpers.ts';
import {
  MARKET_SEED,
  marketConditions,
  releaseInterest,
  weeklyDemandMultiplier,
} from '../src/market.ts';

function stocked(reputation = 40) {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s.reputation = reputation;
  s = bottleBatch(s, s.batches[0].id);
  return act(s, { type: 'list', id: s.wines[0].id });
}

test('release interest follows a much longer nonlinear slope with a lasting audience', () => {
  assert.deepEqual(
    [0, 12, 36, 72, 144, 1200].map((age) =>
      Math.round(releaseInterest(age) * 100),
    ),
    [100, 83, 60, 40, 25, 20],
  );
  assert.ok(
    releaseInterest(0) - releaseInterest(36) >
      releaseInterest(36) - releaseInterest(72),
  );
  let previous = releaseInterest(0);
  for (let age = 1; age <= 1200; age++) {
    const interest = releaseInterest(age);
    assert.ok(interest >= 0.2 && interest <= previous);
    previous = interest;
  }
  assert.equal(releaseInterest(100000), 0.2);
});

test('weekly sales stay inside the forecast range and preserve cash, stock and save continuity', () => {
  let s = stocked();
  for (let week = 0; week < 5; week++) {
    const before = structuredClone(s);
    const expected = demand(s.wines[0], s);
    const forecast = demandForecast(s.wines[0], s);
    assert.ok(expected >= forecast.low && expected <= forecast.high);
    s = act(deserialize(serialize(s)), { type: 'advance' });
    assert.deepEqual(s, act(before, { type: 'advance' }));
    assert.equal(s.wines[0].bottles, before.wines[0].bottles - expected);
    assert.equal(s.stats.sold, before.stats.sold + expected);
    assert.equal(
      s.cash,
      before.cash + expected * before.wines[0].price - upkeep(before),
    );
  }
});

test('pausing and relisting continue release age without aging the wine value', () => {
  let s = stocked();
  const original = structuredClone(s),
    w = original.wines[0];
  s = act(s, { type: 'list', id: w.id });
  for (let i = 0; i < 12; i++) s = act(s, { type: 'advance' });
  assert.equal(s.wines[0].bottles, w.bottles);
  assert.equal(demand(s.wines[0], s), 0);
  s = act(deserialize(serialize(s)), { type: 'list', id: w.id });
  assert.equal(
    releaseInterest(s.week - s.wines[0].bottled),
    releaseInterest(12),
  );
  assert.deepEqual(
    demandForecast(s.wines[0], s),
    demandForecast({ ...w, listed: true }, s),
  );
  assert.equal(s.wines[0].bottled, w.bottled);
  assert.equal(s.wines[0].quality, w.quality);
  assert.equal(s.wines[0].price, w.price);
  assert.equal(
    fairPrice(s.wines[0], s.reputation),
    fairPrice(w, original.reputation),
  );
  assert.equal(
    wholesalePrice(s.wines[0], s.reputation),
    wholesalePrice(w, original.reputation),
  );
});

test('aged demand respects pricing, stock, promotions and the tasting terrace', () => {
  const s = stocked();
  s.week += 12;
  const w = s.wines[0];
  let previous = w.bottles;
  for (let price = 1; price <= 1000; price++) {
    const count = demand({ ...w, price }, s);
    const forecast = demandForecast({ ...w, price }, s);
    assert.ok(Number.isInteger(count) && count >= 0 && count <= previous);
    assert.ok(count >= forecast.low && count <= forecast.high);
    assert.ok(forecast.high <= w.bottles);
    previous = count;
  }
  assert.equal(previous, 0);
  assert.equal(demand({ ...w, bottles: 0 }, s), 0);
  assert.equal(demand({ ...w, bottles: 1 }, s), 1);
  assert.equal(demand({ ...w, bottles: 0, produced: null }, s), 0);
  const baseline = demand(w, s);
  const marketed = act(s, { type: 'marketWine', id: w.id });
  assert.ok(demand(marketed.wines[0], marketed) > baseline);
  const medal = { ...w, judging: { remaining: 0, score: 90 } };
  assert.ok(demand(medal, s) > baseline);
  assert.ok(demand(w, { ...s, upgrades: ['tasting'] }) > baseline);
  assert.equal(marketed.wines[0].bottled, w.bottled);
});

test('new releases keep their age but share shoppers for the same grape and vintage', () => {
  let s = stocked();
  s.week += 144;
  const old = s.wines[0];
  const batchId = s.nextId++;
  s.batches.push({
    id: batchId,
    tankIds: [1, 2],
    variety: old.variety,
    liters: 300,
    quality: old.quality,
    stage: 'ready',
    remaining: 0,
    age: 0,
    oak: false,
    year: old.year,
  });
  s = act(s, { type: 'reserve', id: batchId });
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 200,
    line: { id: old.lineId },
  });
  s = act(s, { type: 'list', id: s.wines[1].id });
  assert.equal(s.wines[1].lineId, old.lineId);
  assert.equal(s.wines[1].bottled, s.week);
  assert.equal(releaseInterest(s.week - s.wines[0].bottled), 0.25);
  assert.equal(releaseInterest(s.week - s.wines[1].bottled), 1);
  assert.ok(demand(s.wines[1], s) > demand(s.wines[0], s));
  assert.equal(
    weeklyDemandMultiplier(s.wines[0], s),
    weeklyDemandMultiplier(s.wines[1], s),
  );
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('recorded bottling dates drive existing saves without inventing legacy sales', () => {
  const original = stocked();
  original.week += 12;
  original.wines[0].produced = null;
  original.wines[0].salesSinceTracking = 7;
  const loaded = deserialize(serialize(original));
  assert.deepEqual(loaded, original);
  const expected = demand(loaded.wines[0], loaded);
  const next = act(loaded, { type: 'advance' });
  assert.equal(next.wines[0].salesSinceTracking, 7 + expected);
  assert.equal(next.wines[0].bottles, original.wines[0].bottles - expected);
});

test('judging that finishes this week still boosts the aged release before its sale', () => {
  let s = stocked();
  s.week += 12;
  s = act(s, { type: 'marketWine', id: s.wines[0].id });
  s.wines[0].judging = { remaining: 1, score: 90 };
  const expected = demand(
    { ...s.wines[0], judging: { remaining: 0, score: 90 } },
    s,
  );
  const next = act(s, { type: 'advance' });
  assert.equal(next.wines[0].bottles, s.wines[0].bottles - expected);
  assert.equal(next.wines[0].judging!.remaining, 0);
  assert.equal(next.wines[0].marketingWeeks, 3);
});

test('sales fluctuate in both directions while the multi-year average tapers', () => {
  const s = stocked(100),
    w = { ...s.wines[0], bottles: 1000000 };
  const counts = Array.from({ length: 216 }, (_, age) =>
    demand(w, { ...s, week: w.bottled + age }),
  );
  assert.ok(
    counts.filter((count, i) => i > 0 && count > counts[i - 1]).length > 50,
  );
  assert.ok(
    counts.filter((count, i) => i > 0 && count < counts[i - 1]).length > 50,
  );
  const average = (start: number, end: number) =>
    counts.slice(start, end).reduce((sum, value) => sum + value, 0) /
    (end - start);
  assert.ok(average(144, 216) < average(0, 72) * 0.6);
  assert.ok(counts.every((count) => Number.isInteger(count) && count > 0));
});

test('seasonal tastes, slow trends and multi-week events are distinct market influences', () => {
  const s = stocked(),
    w = s.wines[0];
  const white = {
    ...w,
    variety: 'chardonnay',
    components: w.components.map((p) => ({ ...p, variety: 'chardonnay' })),
  };
  const summer = { ...s, week: 16 },
    winter = { ...s, week: 22 };
  assert.ok(
    marketConditions(white, summer).season > marketConditions(w, summer).season,
  );
  assert.ok(
    marketConditions(white, winter).season < marketConditions(w, winter).season,
  );
  const events = new Set<string>();
  let previous = marketConditions(w, s);
  for (let week = s.week + 1; week < s.week + 216; week++) {
    const market = marketConditions(w, { ...s, week });
    assert.ok(Math.abs(market.traffic - previous.traffic) < 0.05);
    assert.ok(Math.abs(market.popularity - previous.popularity) < 0.08);
    if (market.event) events.add(market.event.label);
    if (previous.event && previous.event.weeks > 1) {
      assert.equal(market.event?.label, previous.event.label);
      assert.equal(market.event?.weeks, previous.event.weeks - 1);
    }
    previous = market;
  }
  assert.equal(events.size, 2);
  const blend = {
    ...w,
    components: [
      { ...w.components[0], ml: 500 },
      { ...white.components[0], ml: 500 },
    ],
  };
  const mixed = marketConditions(blend, summer);
  assert.equal(mixed.season, 1);
  assert.ok(
    Math.abs(
      mixed.popularity -
        (marketConditions(w, summer).popularity +
          marketConditions(white, summer).popularity) /
          2,
    ) < 1e-12,
  );
});

test('market randomness is stable, independent of other actions and different between releases', () => {
  const s = stocked(),
    w = s.wines[0],
    original = structuredClone(s);
  const timeline = (state = s) =>
    Array.from({ length: 60 }, (_, i) =>
      demand(w, { ...state, week: state.week + i }),
    );
  const expected = timeline();
  assert.deepEqual(timeline(deserialize(serialize(s))), expected);
  assert.deepEqual(
    timeline({ ...s, seed: 42, name: 'Renamed estate' }),
    expected,
  );
  assert.notDeepEqual(
    timeline({ ...s, marketSeed: s.marketSeed + 1 }),
    expected,
  );
  const changed = act(s, { type: 'price', id: w.id, price: w.price + 1 });
  const restored = act(changed, { type: 'price', id: w.id, price: w.price });
  assert.equal(demand(restored.wines[0], restored), demand(w, s));
  const renamed = act(s, { type: 'label', id: w.id, name: 'Renamed wine' });
  assert.equal(demand(renamed.wines[0], renamed), demand(w, s));
  assert.deepEqual(s, original);
  const samples = Array.from({ length: 200 }, (_, i) =>
    weeklyDemandMultiplier(w, { ...s, week: s.week + i }),
  );
  assert.ok(Math.min(...samples) < 0.72 && Math.min(...samples) >= 0.65);
  assert.ok(Math.max(...samples) > 1.28 && Math.max(...samples) <= 1.35);
  assert.ok(
    Math.abs(samples.reduce((sum, x) => sum + x, 0) / samples.length - 1) <
      0.05,
  );
});

test('old saves acquire a reproducible market seed and invalid market seeds are rejected', () => {
  const s = stocked(),
    raw = JSON.parse(serialize(s));
  delete raw.state.marketSeed;
  const loaded = deserialize(JSON.stringify(raw));
  assert.equal(loaded.marketSeed, MARKET_SEED);
  assert.deepEqual(loaded, s);
  for (const marketSeed of [-1, 0.5, NaN, Infinity, 4294967296]) {
    assert.equal(stateSchema.safeParse({ ...s, marketSeed }).success, false);
  }
  for (const age of [0, 36, 144, 100000 - s.wines[0].bottled]) {
    for (const marketSeed of [0, 2026, 4294967295]) {
      const future = { ...s, marketSeed, week: s.wines[0].bottled + age };
      const range = demandForecast(s.wines[0], future),
        count = demand(s.wines[0], future);
      assert.ok(
        Number.isInteger(count) && count >= range.low && count <= range.high,
      );
      assert.ok(range.low >= 0 && range.high <= s.wines[0].bottles);
    }
  }
});

test('splitting the same stock across releases or labels cannot multiply sales', () => {
  const base = stocked();
  base.wines[0].bottles = 336;
  base.wines[0].produced = 336;
  const expected = demand(base.wines[0], base);
  for (const pieces of [1, 12, 336]) {
    const s = structuredClone(base);
    const wine = s.wines[0];
    s.wines = Array.from({ length: pieces }, (_, i) => ({
      ...structuredClone(wine),
      id: s.nextId++,
      label: `Split ${i}`,
      bottles: 336 / pieces,
      produced: 336 / pieces,
      release: i + 1,
    }));
    const sum = s.wines.reduce((n, w) => n + demand(w, s), 0);
    assert.equal(sum, expected);
    const next = act(s, { type: 'advance' });
    assert.equal(next.stats.sold - s.stats.sold, expected);
    assert.equal(next.stats.revenue - s.stats.revenue, expected * wine.price);
    for (const w of s.wines) {
      const range = demandForecast(w, s);
      assert.ok(demand(w, s) >= range.low && demand(w, s) <= range.high);
    }
  }
});
