import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  demand,
  deserialize,
  fairPrice,
  newGame,
  serialize,
  stateSchema,
  upkeep,
  wholesalePrice,
} from '../src/game.ts';
import { hospitalityForecast } from '../src/investments.ts';
import {
  PRESTIGE_TIERS,
  prestigeStanding,
  prestigeInfluence,
  formatPrestige,
} from '../src/prestige.ts';
import { bottleBatch, learn } from './helpers.ts';

function stocked(score: number) {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s = bottleBatch(s, s.batches[0].id);
  s.reputation = score;
  s.wines[0].price = 1;
  return act(s, { type: 'list', id: s.wines[0].id });
}

test('sixteen named tiers resolve exact boundaries and continue beyond the highest title', () => {
  assert.equal(PRESTIGE_TIERS.length, 16);
  assert.equal(new Set(PRESTIGE_TIERS.map((t) => t.name)).size, 16);
  for (const [index, tier] of PRESTIGE_TIERS.entries()) {
    const standing = prestigeStanding(tier.minimum);
    assert.equal(standing.tier, tier);
    assert.equal(standing.index, index);
    assert.equal(standing.next, PRESTIGE_TIERS[index + 1] ?? null);
    if (index) {
      assert.ok(tier.minimum > PRESTIGE_TIERS[index - 1].minimum);
      assert.equal(prestigeStanding(tier.minimum - 0.01).index, index - 1);
    }
  }
  assert.equal(prestigeStanding(1e12).tier.name, 'Pétrus Pantheon');
  assert.equal(prestigeStanding(Number.MAX_VALUE).next, null);
});

test('legacy scores and uncapped Prestige round trip without changing estate assets', () => {
  for (const score of [0, 12.37, 100, 100.01, 65000, 1e12, Number.MAX_VALUE]) {
    const s = newGame();
    s.reputation = score;
    assert.deepEqual(deserialize(serialize(s)), s);
    assert.equal(
      prestigeStanding(deserialize(serialize(s)).reputation).tier,
      prestigeStanding(score).tier,
    );
  }
  for (const score of [-1, NaN, Infinity, -Infinity]) {
    const s = { ...newGame(), reputation: score };
    assert.equal(stateSchema.safeParse(s).success, false);
    assert.throws(() => deserialize(serialize(s)), /compatible/);
  }
});

test('retail sales cross 100 and tier boundaries without extra money or altering wine scores', () => {
  for (const score of [99.99, 119.96, 64999.96, 1000000]) {
    const s = stocked(score),
      copy = structuredClone(s);
    const sold = demand(s.wines[0], s);
    assert.ok(sold > 0);
    const next = act(s, { type: 'advance' });
    assert.deepEqual(s, copy);
    assert.equal(next.reputation, Number((score + sold * 0.04).toFixed(2)));
    assert.ok(next.reputation > 100);
    assert.equal(next.cash, s.cash + sold - upkeep(s));
    assert.equal(next.wines[0].quality, s.wines[0].quality);
    assert.deepEqual(
      next.ledger.slice(0, 2).map((l) => l.label),
      ['Weekly estate upkeep', 'Wine shop sales'],
    );
    if (score === 119.96 || score === 64999.96)
      assert.equal(
        prestigeStanding(next.reputation).index,
        prestigeStanding(score).index + 1,
      );
    assert.deepEqual(deserialize(serialize(next)), next);
  }
});

test('wholesale sales keep earning beyond the final tier and cannot be collected twice', () => {
  const s = stocked(65000),
    wine = s.wines[0];
  const next = act(s, { type: 'wholesale', id: wine.id });
  assert.equal(next.reputation, 65000 + wine.bottles * 0.01);
  assert.equal(
    next.cash,
    s.cash + wine.bottles * wholesalePrice(wine, s.reputation, s),
  );
  assert.equal(next.wines[0].quality, wine.quality);
  assert.throws(
    () => act(next, { type: 'wholesale', id: wine.id }),
    /sold out/,
  );
  assert.deepEqual(deserialize(serialize(next)), next);
});

test('financial trouble can lower the current tier but never makes Prestige negative', () => {
  for (const score of [1, 25, 1000]) {
    const s = newGame();
    s.reputation = score;
    s.cash = 0;
    const next = act(s, { type: 'advance' });
    assert.equal(next.reputation, Math.max(0, score - 2));
    assert.ok(next.log.some((l) => l.text.includes('Prestige')));
    if (score === 25) assert.equal(prestigeStanding(next.reputation).index, 0);
    assert.deepEqual(deserialize(serialize(next)), next);
  }
});

test('Prestige influence preserves early balance and grows with diminishing returns', () => {
  for (const score of [0, 12, 50, 99, 100])
    assert.equal(prestigeInfluence(score), score);
  assert.equal(prestigeInfluence(200), 125);
  assert.equal(prestigeInfluence(400), 150);
  assert.equal(prestigeInfluence(800), 175);
  assert.ok(
    prestigeInfluence(200) - prestigeInfluence(100) >
      prestigeInfluence(300) - prestigeInfluence(200),
  );
  assert.ok(Number.isFinite(prestigeInfluence(Number.MAX_VALUE)));
});

test('large Prestige retains pricing, shop stock and hospitality capacity limits', () => {
  const s = stocked(100);
  learn(s, 'estate_lodging', 'hospitality');
  s.upgrades = ['visitorCenter', 'tastingRoom', 'guesthouse'];
  let lastValue = 0,
    lastDemand = 0;
  for (const score of [100, 1000, 65000, 1e12, Number.MAX_VALUE]) {
    s.reputation = score;
    const value = fairPrice(s.wines[0], score),
      sales = demand(s.wines[0], s);
    assert.ok(value >= lastValue && value <= 1000);
    assert.ok(sales >= lastDemand && sales <= s.wines[0].bottles);
    const hospitality = hospitalityForecast(s);
    assert.ok(hospitality.visitors <= hospitality.capacity);
    assert.ok(hospitality.rooms <= 24);
    assert.ok(Number.isFinite(hospitality.revenue));
    assert.ok(fairPrice({ quality: 100 }, score) <= 1000);
    if (score >= 1000) assert.equal(fairPrice({ quality: 100 }, score), 1000);
    lastValue = value;
    lastDemand = sales;
    assert.deepEqual(deserialize(serialize(s)), s);
  }
  const invalidWine = structuredClone(s);
  invalidWine.wines[0].quality = 101;
  assert.equal(stateSchema.safeParse(invalidWine).success, false);
});

test('Prestige formatting keeps fractional gains and very large totals readable', () => {
  assert.equal(formatPrestige(12.04), '12.04');
  assert.equal(formatPrestige(65000), '65,000');
  assert.equal(formatPrestige(65000, true), '65K');
  assert.ok(formatPrestige(Number.MAX_VALUE).length < 16);
});
