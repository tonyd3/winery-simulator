import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  deserialize,
  serialize,
  weather,
  harvestYield,
  upkeep,
} from '../src/game.ts';
import {
  operatingCost,
  vineyardFootprint,
  investmentBill,
  additionalLandUpkeep,
  parcelPurchaseUpkeep,
} from '../src/investments.ts';
import { learn } from './helpers.ts';

test('agriculture charges grow with owned area, expanded plots, districts and estates', () => {
  let s = learn(newGame(), 'soil_mapping');
  s.cash = 1000000;
  assert.deepEqual(vineyardFootprint(s), { hectares: 3, districts: 1 });
  assert.equal(operatingCost(s, 'compost'), 24);
  s = act(s, { type: 'expandPlot', id: 1 });
  assert.equal(operatingCost(s, 'compost'), 28);
  s = act(s, { type: 'expandEstate', id: 1 });
  assert.deepEqual(vineyardFootprint(s), { hectares: 3.6, districts: 1 });
  for (let id = 7; id <= 12; id++) s = act(s, { type: 'buyPlot', id });
  assert.deepEqual(vineyardFootprint(s), { hectares: 10.4, districts: 2 });
  assert.equal(operatingCost(s, 'compost'), 75);
  s = act(s, { type: 'acquireEstate', region: 'mosel', name: 'River' });
  assert.ok(vineyardFootprint(s).districts > 2);
  assert.ok(operatingCost(s, 'compost') > 75);
  const cost = operatingCost(s, 'compost');
  s = act(s, { type: 'upgrade', upgrade: 'compost' });
  s = act(s, { type: 'operateUpgrade', upgrade: 'compost', active: false });
  assert.equal(investmentBill(s, 'compost'), Math.ceil(cost * 0.25));
  assert.deepEqual(deserialize(serialize(s)), s);
});

test('fractional-hectare boundaries bill exact dollars and match expansion previews', () => {
  let s = learn(newGame(), 'soil_mapping');
  s.cash = 1000000;
  s = act(s, { type: 'upgrade', upgrade: 'irrigation' });
  s = act(act(s, { type: 'expandPlot', id: 1 }), { type: 'expandPlot', id: 1 });
  assert.equal(vineyardFootprint(s).hectares, 4.2);
  const next = act(s, { type: 'expandPlot', id: 2 });
  assert.equal(additionalLandUpkeep(s, 15, 0.4), 23);
  assert.equal(upkeep(next) - upkeep(s), 23);
  assert.equal(
    operatingCost(s, 'viticulturist', { hectares: 8.8, districts: 1 }),
    480,
  );
  assert.equal(
    operatingCost(s, 'compost', { hectares: 3.65, districts: 1 }),
    28,
  );
});

test('cover crops trade ripening speed for vine health; mulching and drainage target different weather', () => {
  for (const sky of ['Light rain', 'Dry spell', 'Overcast']) {
    const week = Array.from({ length: 100 }, (_, i) => i + 1).find(
      (w) => w % 12 < 9 && w % 12 > 0 && weather(w + 1).name === sky,
    )!;
    assert.ok(week);
    const s = newGame();
    s.week = week;
    s.cash = 100000;
    s.plots[0].growth = 25;
    s.plots[0].health = 80;
    s.plots[0].harvestedYear = 0;
    const base = act(s, { type: 'advance' }).plots[0];
    const cover = act({ ...s, upgrades: ['coverCrops'] }, { type: 'advance' })
      .plots[0];
    assert.equal(cover.growth, base.growth - 1);
    assert.equal(cover.health, base.health + 1);
    const mulched = act({ ...s, upgrades: ['mulching'] }, { type: 'advance' })
      .plots[0];
    assert.equal(mulched.health, base.health + (sky === 'Dry spell' ? 3 : 0));
    const drained = act({ ...s, upgrades: ['drainage'] }, { type: 'advance' })
      .plots[0];
    assert.equal(drained.growth, base.growth + (sky === 'Light rain' ? 2 : 0));
    const irrigated = act(
      { ...s, upgrades: ['irrigation'] },
      { type: 'advance' },
    ).plots[0];
    const both = act(
      { ...s, upgrades: ['irrigation', 'mulching'] },
      { type: 'advance' },
    ).plots[0];
    assert.equal(both.health, irrigated.health);
  }
});

test('compost increases picked volume and retains its scaled operating charge after suspension', () => {
  let s = learn(newGame(), 'ampelography');
  s.cash = 100000;
  const before = harvestYield(s, s.plots[0]);
  s = act(s, { type: 'upgrade', upgrade: 'compost' });
  s = act(s, { type: 'harvest', id: 1 });
  assert.equal(s.grapes[0].kg, Math.round(before * 1.04));
  s = act(s, { type: 'operateUpgrade', upgrade: 'compost', active: false });
  assert.equal(investmentBill(s, 'compost'), 24);
});

test('land previews include active and suspended agriculture in the actual next bill', () => {
  for (const suspended of [false, true]) {
    let s = learn(newGame(), 'ampelography');
    s.cash = 1000000;
    s = act(s, { type: 'upgrade', upgrade: 'compost' });
    if (suspended)
      s = act(s, { type: 'operateUpgrade', upgrade: 'compost', active: false });
    const expanded = act(s, { type: 'expandPlot', id: 1 });
    assert.equal(
      upkeep(expanded) - upkeep(s),
      additionalLandUpkeep(s, 15, 0.6),
    );
    const district = act(s, { type: 'expandEstate', id: 1 });
    assert.equal(upkeep(district) - upkeep(s), 35);
    const purchased = act(district, { type: 'buyPlot', id: 7 });
    assert.equal(
      upkeep(purchased) - upkeep(district),
      parcelPurchaseUpkeep(district, 7),
    );
    const estate = act(s, {
      type: 'acquireEstate',
      region: 'mosel',
      name: 'River',
    });
    assert.equal(
      upkeep(estate) - upkeep(s),
      additionalLandUpkeep(s, 175, 3, 1),
    );
  }
});
