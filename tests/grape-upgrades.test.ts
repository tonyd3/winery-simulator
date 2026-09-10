import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  harvestQuality,
  harvestYield,
  deserialize,
  serialize,
  REGION_IDS,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { UPGRADES, harvestInvestmentEffects } from '../src/investments.ts';
import type { Upgrade } from '../src/investments.ts';
import { learn, bottleBatch } from './helpers.ts';

const additions = [
  'compost',
  'canopy',
  'precisionIrrigation',
  'selectiveHarvest',
] as const;
function funded() {
  const s = learn(newGame(), 'precision_viticulture', 'fruit_selection');
  s.cash = 2000000;
  return s;
}
const buy = (s: GameState, upgrade: Upgrade) =>
  act(s, { type: 'upgrade', upgrade });
const suspend = (s: GameState, upgrade: Upgrade) =>
  act(s, { type: 'operateUpgrade', upgrade, active: false });

test('grape upgrades retain regional vintage differences without double-counting sorting', () => {
  for (const region of REGION_IDS) {
    const scores = new Set<number>();
    for (let year = 1; year <= 20; year++) {
      const base = newGame(region);
      base.week = (year - 1) * 12 + 6;
      base.plots[0].health = base.plots[0].growth = 100;
      const s: GameState = {
        ...base,
        upgrades: ['irrigation', 'sorting', ...additions],
      };
      const score = harvestQuality(s, s.plots[0]);
      assert.equal(score, harvestQuality(base, base.plots[0]) + 10);
      assert.equal(act(s, { type: 'harvest', id: 1 }).grapes[0].quality, score);
      scores.add(score);
    }
    assert.ok(
      scores.size > 1,
      `${region}: upgrades must preserve vintage variation`,
    );
  }
});

test('each grape upgrade requires study and cash, charges once, and survives save and resume', () => {
  for (const id of additions) {
    const unlearned = newGame();
    unlearned.cash = 1000000;
    assert.throws(() => buy(unlearned, id), /Study/);
    const base =
      id === 'precisionIrrigation' ? buy(funded(), 'irrigation') : funded();
    assert.throws(
      () => buy({ ...base, cash: UPGRADES[id].cost - 1 }, id),
      /more/,
    );
    const owned = buy(base, id);
    assert.equal(owned.cash, base.cash - UPGRADES[id].cost);
    assert.throws(() => buy(owned, id), /already/);
    const paused = suspend(owned, id);
    const loaded = deserialize(serialize(paused));
    assert.deepEqual(loaded, paused);
    const resumed = act(loaded, {
      type: 'operateUpgrade',
      upgrade: id,
      active: true,
    });
    assert.deepEqual(
      harvestInvestmentEffects(resumed, resumed.plots[0]),
      harvestInvestmentEffects(owned, owned.plots[0]),
    );
    assert.deepEqual(
      base.upgrades,
      id === 'precisionIrrigation' ? ['irrigation'] : [],
    );
  }
});

test('canopy management rewards healthy vines at the exact threshold and care unlocks it', () => {
  const base = funded();
  base.plots[0].health = 79;
  let s = buy(base, 'canopy');
  assert.equal(
    harvestQuality(s, s.plots[0]),
    harvestQuality(base, base.plots[0]),
  );
  const healthy = { ...s.plots[0], health: 80 };
  assert.equal(harvestQuality(s, healthy), harvestQuality(base, healthy) + 2);
  s = act(s, { type: 'tend', id: 1 });
  assert.equal(harvestInvestmentEffects(s, s.plots[0]).quality, 2);
  assert.equal(
    harvestQuality(s, s.plots[0]),
    harvestQuality(base, s.plots[0]) + 2,
  );
});

test('precision irrigation needs ripe grapes and an operating irrigation system', () => {
  assert.throws(
    () => buy(funded(), 'precisionIrrigation'),
    /operating Drip irrigation/,
  );
  const base = buy(funded(), 'irrigation');
  let s = buy(base, 'precisionIrrigation');
  for (const [growth, expected] of [
    [94, 0],
    [95, 2],
    [100, 2],
  ]) {
    const p = { ...s.plots[0], growth };
    assert.equal(harvestQuality(s, p), harvestQuality(base, p) + expected);
  }
  s = suspend(s, 'irrigation');
  assert.ok(s.suspendedUpgrades.includes('precisionIrrigation'));
  const p = { ...s.plots[0], growth: 100 };
  assert.equal(harvestInvestmentEffects(s, p).quality, 0);
  s = act(deserialize(serialize(s)), {
    type: 'operateUpgrade',
    upgrade: 'irrigation',
    active: true,
  });
  assert.equal(harvestInvestmentEffects(s, p).quality, 0);
  s = act(s, {
    type: 'operateUpgrade',
    upgrade: 'precisionIrrigation',
    active: true,
  });
  assert.equal(harvestInvestmentEffects(s, p).quality, 2);
});

test('bonuses stack across estates and selective picking reduces actual expanded harvests', () => {
  let base = funded();
  learn(base, 'grape_riesling');
  base = act(base, {
    type: 'acquireEstate',
    region: 'mosel',
    name: 'River Vines',
  });
  base = act(base, { type: 'plant', id: 25, variety: 'riesling' });
  for (const p of base.plots.filter((p) => p.variety)) {
    p.health = p.growth = 100;
    p.expansions = p.bearingExpansions = 2;
  }
  let s = buy(buy(base, 'irrigation'), 'sorting');
  for (const id of additions) s = buy(s, id);
  for (const id of [1, 25]) {
    const p = s.plots.find((p) => p.id === id)!;
    assert.deepEqual(harvestInvestmentEffects(s, p), {
      quality: 10,
      yieldMultiplier: 0.9,
    });
    assert.equal(
      harvestQuality(s, p),
      Math.min(100, harvestQuality(base, p) + 10),
    );
    assert.equal(harvestYield(s, p), Math.round(harvestYield(base, p) * 0.9));
    const picked = act(s, { type: 'harvest', id });
    assert.equal(picked.grapes[0].quality, harvestQuality(s, p));
    assert.equal(picked.grapes[0].kg, harvestYield(s, p));
    assert.equal(picked.stats.harvested, picked.grapes[0].kg);
    assert.deepEqual(deserialize(serialize(picked)), picked);
  }
  const paused = suspend(s, 'selectiveHarvest');
  assert.equal(
    harvestYield(paused, paused.plots[0]),
    harvestYield(base, base.plots[0]),
  );
  assert.equal(
    harvestQuality(paused, paused.plots[0]),
    harvestQuality(s, s.plots[0]) - 3,
  );
});

test('buying and suspending grape upgrades preserves already picked grapes, batches, reserves and bottles', () => {
  let s = act(funded(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = act(act(s, { type: 'advance' }), { type: 'advance' });
  s = bottleBatch(s, s.batches[0].id);
  s = act(s, { type: 'harvest', id: 2 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = act(s, { type: 'advance' });
  // The shared production snapshot includes a stored remainder, bottled wine,
  // and a fermenting batch; purchases do not rewrite any of them.
  const snapshot = structuredClone({
    grapes: s.grapes,
    batches: s.batches,
    reserves: s.reserves,
    wines: s.wines,
  });
  s = buy(s, 'irrigation');
  for (const id of additions) s = buy(s, id);
  for (const id of additions) s = suspend(s, id);
  s = deserialize(serialize(s));
  assert.deepEqual(
    {
      grapes: s.grapes,
      batches: s.batches,
      reserves: s.reserves,
      wines: s.wines,
    },
    snapshot,
  );

  const unprocessed = act(funded(), { type: 'harvest', id: 1 });
  const upgraded = buy(unprocessed, 'selectiveHarvest');
  assert.deepEqual(upgraded.grapes, unprocessed.grapes);
  const fermented = act(upgraded, {
    type: 'ferment',
    id: upgraded.grapes[0].id,
    oak: false,
  });
  assert.equal(fermented.batches[0].quality, unprocessed.grapes[0].quality);
});

test('new equipment cannot turn neglected fruit into exceptional grapes and unplanted plots have no effects', () => {
  for (const region of REGION_IDS) {
    const s = newGame(region);
    s.upgrades = ['irrigation', 'sorting', ...additions];
    const p = { ...s.plots[0], health: 35, growth: 80 };
    assert.ok(harvestQuality(s, p) + 3 + 6 + 4 + 3 < 90);
    assert.deepEqual(harvestInvestmentEffects(s, { ...p, variety: null }), {
      quality: 0,
      yieldMultiplier: 1,
    });
  }
});
