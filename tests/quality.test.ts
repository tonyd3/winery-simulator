import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  REGION_IDS,
  VARIETIES,
  harvestQuality,
  quality,
  fairPrice,
  wholesalePrice,
  demand,
  serialize,
  deserialize,
  stateSchema,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { assess, CELLAR_TASTING } from '../src/winemaking.ts';
import { BLEND_COMPATIBILITY } from '../src/blendCompatibility.ts';
import { bottleBatch } from './helpers.ts';
import { VESSEL_IDS } from '../src/maturation.ts';
import type { MaturationVessel } from '../src/maturation.ts';

function mature(s: GameState, vessel: MaturationVessel) {
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s = act(s, { type: 'age', id: s.batches[0].id, vessel });
  const weeks = s.batches[0].maturationProfile!.routes[vessel].readyFrom;
  for (let i = 0; i < weeks; i++) s = act(s, { type: 'advance' });
  return s;
}

function ferment(s: GameState, oak = true) {
  s = act(s, { type: 'harvest', id: 1 });
  return act(s, { type: 'ferment', id: s.grapes[0].id, oak });
}

test('ordinary first vintages stay below 90 even with temperature control and full aging', () => {
  for (const region of REGION_IDS) {
    const start = newGame(region);
    const base = harvestQuality(start, start.plots[0]);
    assert.ok(base >= 60 && base < 80, `${region}: ${base}`);
    start.upgrades = ['lab'];
    for (const oak of [false, true]) {
      const s = ferment(start, oak);
      assert.equal(s.batches[0].agingProfile, 'varietal-v1');
      for (const vessel of VESSEL_IDS) {
        const matured = quality(mature(s, vessel).batches[0]);
        assert.ok(
          matured + CELLAR_TASTING.variation < 90,
          `${region}: ${vessel}`,
        );
      }
    }
  }
});

test('health, ripeness, site and finesse create a broad earned quality spread', () => {
  const basic = newGame();
  const healthy = { ...basic.plots[0], health: 100, growth: 100 };
  const neglected = { ...healthy, health: 35, growth: 80 };
  const perfectScore = harvestQuality(basic, healthy);
  const weakScore = harvestQuality(basic, neglected);
  assert.ok(perfectScore - weakScore >= 30);
  assert.equal(
    perfectScore - harvestQuality(basic, { ...healthy, growth: 80 }),
    6,
  );
  assert.equal(
    perfectScore - harvestQuality(basic, { ...healthy, health: 80 }),
    8,
  );
  assert.equal(perfectScore - harvestQuality(basic, { ...healthy, id: 2 }), 8);

  const elite = newGame('burgundy');
  elite.plots[0].health = elite.plots[0].growth = 100;
  elite.upgrades = ['lab'];
  const s = ferment(elite);
  const matured = quality(mature(s, 'neutral').batches[0]);
  assert.ok(
    matured >= 90,
    `Exceptional Pinot must remain achievable: ${matured}`,
  );
  assert.ok(
    matured < 95,
    'Care and equipment alone should not guarantee a perfect wine',
  );
  assert.ok(
    weakScore + 3 + 6 + BLEND_COMPATIBILITY.max + CELLAR_TASTING.variation < 90,
  );
});

test('90+ results remain a small tail across classic grapes and growing conditions', () => {
  let total = 0,
    exceptional = 0,
    lowest = 100,
    highest = 0;
  for (const region of REGION_IDS) {
    const s = newGame(region);
    for (const variety of Object.keys(VARIETIES)) {
      for (const [health, growth] of [
        [40, 80],
        [70, 90],
        [92, 88],
        [100, 100],
      ]) {
        const fruit = harvestQuality(s, {
          ...s.plots[0],
          variety,
          health,
          growth,
        });
        // Give every scenario the maximum six-point maturation benefit.
        const base = fruit + 3 + 6;
        for (let tasting = -3; tasting <= 3; tasting++) {
          const score = Math.max(0, Math.min(100, base + tasting));
          lowest = Math.min(lowest, score);
          highest = Math.max(highest, score);
          exceptional += Number(score >= 90);
          total++;
        }
      }
    }
  }
  assert.ok(highest - lowest >= 50);
  assert.ok(exceptional > 0);
  assert.ok(exceptional / total < 0.02, `${exceptional}/${total} reached 90+`);
});

test('older balanced and original batches retain their saved aging curves', () => {
  const s = ferment(newGame());
  s.batches[0].agingProfile = 'balanced';
  delete s.batches[0].maturationProfile;
  const b = s.batches[0];
  const gains = Array.from(
    { length: 9 },
    (_, age) => quality({ ...b, age }) - b.quality,
  );
  assert.equal(gains[0], 0);
  assert.equal(gains[8], 6);
  assert.ok(gains[2] > gains[8] - gains[6]);
  assert.equal(quality({ ...b, oak: false, age: 8 }) - b.quality, 3);
  assert.deepEqual(deserialize(serialize(s)), s);

  const legacy = structuredClone(s);
  delete legacy.batches[0].agingProfile;
  legacy.batches[0].quality = 70;
  legacy.batches[0].stage = 'aging';
  legacy.batches[0].remaining = 0;
  legacy.batches[0].age = 2;
  assert.equal(quality(deserialize(serialize(legacy)).batches[0]), 75);
  const stored = act(legacy, { type: 'reserve', id: b.id });
  assert.equal(assess(stored.reserves[0].components).base, 75);
  const malformed = JSON.parse(JSON.stringify(s));
  malformed.batches[0].agingProfile = 'unlimited';
  assert.equal(stateSchema.safeParse(malformed).success, false);
});

test('value accelerates above 90 and reputation strengthens only the exceptional premium', () => {
  for (const score of [40, 70, 85, 90])
    assert.equal(
      fairPrice({ quality: score }, 50),
      Math.round(7 + score * 0.24 + 50 * 0.055),
    );
  const prices = Array.from({ length: 11 }, (_, i) =>
    fairPrice({ quality: 90 + i }, 50),
  );
  const increments = prices.slice(1).map((price, i) => price - prices[i]);
  assert.ok(increments.every((gain, i) => i === 0 || gain > increments[i - 1]));
  assert.ok(prices[5] > prices[0] * 5);
  assert.ok(prices[10] > prices[5] * 3);
  assert.ok(
    fairPrice({ quality: 95 }, 90) - fairPrice({ quality: 95 }, 10) >
      fairPrice({ quality: 85 }, 90) - fairPrice({ quality: 85 }, 10),
  );
  for (const reputation of [0, 50, 100]) {
    for (let score = 0; score <= 100; score++) {
      const price = fairPrice(
        {
          quality: score,
          marketingWeeks: 4,
          judging: { remaining: 0, score: 100 },
        },
        reputation,
      );
      assert.ok(Number.isInteger(price) && price >= 1 && price <= 1000);
    }
  }
});

test('premium bottle values feed initial prices, retail demand, wholesale and saves', () => {
  let s = ferment(newGame('burgundy'));
  s.batches[0].stage = 'ready';
  s.batches[0].remaining = 0;
  // An existing exceptional batch must retain its score and gain the new valuation.
  s.batches[0].quality = 98;
  s = bottleBatch(s, s.batches[0].id);
  const original = structuredClone(s);
  const w = s.wines[0];
  assert.equal(w.price, fairPrice(w, s.reputation));
  assert.ok(w.price > 50);
  const forecast = demand({ ...w, listed: true }, s);
  assert.ok(forecast > 0);
  assert.equal(demand({ ...w, price: 1000, listed: true }, s), 0);
  const offer = wholesalePrice(w, s.reputation);
  const sold = act(s, { type: 'wholesale', id: w.id });
  assert.equal(sold.cash, s.cash + offer * w.bottles);
  assert.deepEqual(s, original);
  assert.deepEqual(deserialize(serialize(sold)), sold);
  assert.equal(sold.wines[0].quality, w.quality);
});
