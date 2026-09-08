import { allGrapes } from './helpers.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  newGame,
  serialize,
  deserialize,
  stateSchema,
  getLand,
  estateArea,
  harvestYield,
  harvestQuality,
  plotExpansionCost,
  plotPlantingCost,
  plotHarvestCost,
  plotTendCost,
  plotRemovalCost,
  plantingCost,
  upkeep,
  occupiedTankCount,
  fermentationPlan,
  grapeLiters,
  calendar,
  VARIETIES,
} from '../src/game.ts';
import type { GameState } from '../src/game.ts';
import { plotId } from '../src/estates.ts';
import { volume, DEFAULT_DESIGN } from '../src/winemaking.ts';

const valid = (s: GameState) => assert.deepEqual(deserialize(serialize(s)), s);
const expand = (s: GameState, id = 1) => act(s, { type: 'expandPlot', id });
function funded() {
  const s = allGrapes(newGame());
  s.cash = 1000000;
  return s;
}
function tick(s: GameState, weeks = 1) {
  for (let i = 0; i < weeks; i++) s = act(s, { type: 'advance' });
  return s;
}

test('expanding a planted plot costs money, preserves its current crop, and queues more acreage', () => {
  const before = newGame(),
    snapshot = structuredClone(before);
  const s = expand(before),
    p = s.plots[0];
  assert.deepEqual(before, snapshot);
  assert.equal(s.cash, before.cash - 3600);
  assert.equal(getLand(s, 1).area, '1.8');
  assert.equal(estateArea(s), 3.6);
  assert.equal(upkeep(s), upkeep(before) + 15);
  assert.equal(p.expansions, 1);
  assert.equal(p.bearingExpansions, 0);
  assert.deepEqual({ ...p, expansions: 0 }, before.plots[0]);
  assert.equal(harvestYield(s, p), harvestYield(before, before.plots[0]));
  assert.equal(harvestQuality(s, p), harvestQuality(before, before.plots[0]));
  assert.equal(s.seed, before.seed);
  assert.equal(s.week, before.week);
  assert.equal(s.knowledge, before.knowledge);
  assert.deepEqual(s.cellar, before.cellar);
  assert.deepEqual(s.grapes, before.grapes);
  const harvest = act(s, { type: 'harvest', id: 1 });
  assert.equal(
    harvest.grapes[0].kg,
    act(before, { type: 'harvest', id: 1 }).grapes[0].kg,
  );
  assert.equal(harvest.cash, s.cash - 180);
  valid(harvest);
});

test('new rows activate next spring in unselected estates without altering their grape or quality model', () => {
  let s = funded();
  s = act(s, { type: 'acquireEstate', region: 'mosel', name: 'River Estate' });
  s = act(s, { type: 'plant', id: plotId(2), variety: 'riesling' });
  s = expand(s, plotId(2));
  s = act(s, { type: 'visitEstate', id: 1 });
  s = tick(s, 6);
  assert.equal(calendar(s.week).week, 12);
  assert.equal(s.plots.find((p) => p.id === plotId(2))!.bearingExpansions, 0);
  s = tick(deserialize(serialize(s)));
  const p = s.plots.find((p) => p.id === plotId(2))!;
  assert.equal(s.activeEstate, 1);
  assert.equal(p.bearingExpansions, 1);
  assert.equal(p.variety, 'riesling');
  assert.equal(harvestYield(s, p), harvestYield(s, p, 1));
  assert.ok(harvestYield(s, p) > harvestYield(s, p, 0));
  assert.equal(getLand(s, p.id).region, 'mosel');
  valid(s);
});

test('four purchases reach triple size at increasing prices, with no second harvest or crop reset', () => {
  let s = act(funded(), { type: 'harvest', id: 1 });
  const harvested = s.plots[0].harvestedYear;
  for (const [level, cost] of [3600, 5400, 7200, 9000].entries()) {
    assert.equal(plotExpansionCost(s, s.plots[0]), cost);
    const cash = s.cash;
    s = expand(s);
    assert.equal(s.cash, cash - cost);
    assert.equal(s.plots[0].expansions, level + 1);
    assert.equal(s.plots[0].growth, 0);
    assert.equal(s.plots[0].harvestedYear, harvested);
    assert.throws(() => act(s, { type: 'harvest', id: 1 }), /80%/);
  }
  assert.equal(getLand(s, 1).area, '3.6');
  assert.equal(getLand(s, 1).yield, 1080);
  assert.equal(upkeep(s), 220);
  assert.throws(() => expand(s), /maximum size/);
  valid(s);
});

test('empty expanded plots charge for planting the full area and replacing vines retains the land', () => {
  let s = expand(funded(), 3);
  s = expand(s, 3);
  const p = s.plots[2];
  assert.equal(p.expansions, 2);
  assert.equal(p.bearingExpansions, 2);
  assert.equal(getLand(s, 3).area, '2.0');
  assert.equal(plotPlantingCost(s, p, 'merlot'), plantingCost(s, 'merlot') * 2);
  const cash = s.cash;
  s = act(s, { type: 'plant', id: 3, variety: 'merlot' });
  assert.equal(s.cash, cash - plotPlantingCost(s, p, 'merlot'));
  assert.equal(s.plots[2].growth, 15);
  assert.equal(plotTendCost(s.plots[2]), 180);
  assert.equal(plotHarvestCost(s.plots[2]), 360);
  assert.equal(plotRemovalCost(s.plots[2]), 240);
  const careCash = s.cash;
  s = act(s, { type: 'tend', id: 3 });
  assert.equal(s.cash, careCash - 180);
  const clearCash = s.cash;
  s = act(s, { type: 'uproot', id: 3 });
  assert.equal(s.cash, clearCash - 240);
  assert.equal(s.plots[2].variety, null);
  assert.equal(getLand(s, 3).area, '2.0');
  s = act(s, { type: 'plant', id: 3, variety: 'cabernet' });
  assert.equal(s.plots[2].expansions, 2);
  valid(s);
});

test('a fully enlarged real plot produces a six-tank harvest that preserves all liquid through bottling', () => {
  let s = funded();
  for (let i = 0; i < 4; i++) s = expand(s);
  s = tick(s, 7);
  s.plots[0].growth = 100;
  s.plots[0].health = 100;
  assert.equal(s.plots[0].bearingExpansions, 4);
  const cash = s.cash;
  s = act(s, { type: 'harvest', id: 1 });
  const g = s.grapes[0];
  assert.equal(g.kg, 1080);
  assert.equal(s.cash, cash - 540);
  assert.equal(fermentationPlan(s, g.kg).missing, 456);
  const partial = act(s, { type: 'ferment', id: g.id, oak: false });
  assert.equal(partial.batches[0].liters, 300);
  assert.equal(partial.grapes[0].kg, 652);
  assert.equal(grapeLiters(partial.grapes[0].kg), 456);
  valid(partial);
  s = act(s, { type: 'expandCellar' });
  s = act(s, { type: 'buyTank', count: 4 });
  const processing = s.cash;
  s = act(s, { type: 'ferment', id: g.id, oak: false });
  assert.equal(s.cash, processing - 840);
  assert.equal(occupiedTankCount(s), 6);
  assert.equal(s.batches[0].liters, 756);
  valid(s);
  s = tick(deserialize(serialize(s)), 2);
  s = act(s, { type: 'reserve', id: s.batches[0].id });
  assert.equal(occupiedTankCount(s), 0);
  assert.equal(volume(s.reserves[0].components), 756000);
  assert.equal(s.reserves[0].components[0].estateId, 1);
  s.kits = 2000;
  s = act(s, { type: 'expandBottleStorage', kind: 'warehouse' });
  s = act(s, {
    type: 'bottle',
    id: s.reserves[0].id,
    bottles: 1008,
    line: { name: 'Long Rows', design: DEFAULT_DESIGN },
  });
  assert.equal(s.wines[0].produced, 1008);
  assert.equal(volume(s.wines[0].components), 756000);
  valid(s);
});

test('all catalog grapes fit the enlarged harvest schema and nine-tank import limit', () => {
  let s = funded();
  s = act(s, { type: 'buyPlot', id: 4 });
  s = act(s, { type: 'plant', id: 4, variety: 'merlot' });
  for (let i = 0; i < 4; i++) s = expand(s, 4);
  s = tick(s, 7);
  s = act(s, { type: 'expandCellar' });
  s = act(s, { type: 'expandCellar' });
  s = act(s, { type: 'buyTank', count: 7 });
  for (const variety of Object.keys(VARIETIES)) {
    const scenario = structuredClone(s),
      p = scenario.plots[3];
    p.variety = variety;
    p.growth = 100;
    p.health = 100;
    let wine = act(scenario, { type: 'harvest', id: 4 });
    const g = wine.grapes[0];
    assert.ok(g.kg <= 1800 && g.kg > 600);
    wine = act(wine, { type: 'ferment', id: g.id, oak: false });
    assert.equal(wine.batches[0].liters, grapeLiters(g.kg));
    assert.ok(occupiedTankCount(wine) > 3 && occupiedTankCount(wine) <= 9);
    valid(wine);
  }
  s.grapes.push({
    id: s.nextId++,
    variety: 'merlot',
    kg: 1800,
    quality: 70,
    picked: s.week,
  });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  assert.equal(occupiedTankCount(s), 9);
  assert.equal(s.batches[0].liters, 1260);
  valid(s);
});

test('older version-five saves default plots to original size without changing other assets', () => {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: true });
  const old = {
    ...s,
    plots: s.plots.map(({ expansions, bearingExpansions, ...p }) => p),
  };
  const loaded = deserialize(
    JSON.stringify({ game: 'terroir', savedAt: 'previous', state: old }),
  );
  assert.deepEqual(loaded, s);
  assert.equal(estateArea(loaded), 3);
  assert.deepEqual(loaded.batches, s.batches);
  valid(loaded);
});

test('invalid and unaffordable expansions and malformed imports leave the state intact', () => {
  const s = newGame(),
    snapshot = structuredClone(s);
  assert.throws(() => expand(s, 4), /Buy this parcel/);
  assert.throws(() => expand(s, 999), /not found/);
  assert.deepEqual(s, snapshot);
  const poor = { ...s, cash: 3599 };
  assert.throws(() => expand(poor), /more/);
  assert.equal(poor.cash, 3599);
  assert.equal(poor.plots[0].expansions, 0);
  for (const mutate of [
    (x: GameState) => {
      x.plots[0].expansions = 5;
    },
    (x: GameState) => {
      x.plots[0].expansions = 1.5;
    },
    (x: GameState) => {
      x.plots[0].bearingExpansions = 1;
    },
    (x: GameState) => {
      x.plots[3].expansions = 1;
    },
    (x: GameState) => {
      x.plots[2].expansions = 1;
    },
  ]) {
    const bad = structuredClone(s);
    mutate(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
    assert.throws(() => deserialize(serialize(bad)), /compatible/);
  }
});

test('fractional hectare expansions retain accurate regional and portfolio totals', () => {
  let s = funded();
  s = act(s, { type: 'acquireEstate', region: 'tuscany', name: 'Tuscan Rows' });
  s = act(s, { type: 'expandEstate', id: 2 });
  const id = plotId(2, 1, 5);
  s = act(s, { type: 'buyPlot', id });
  s = expand(s, id);
  assert.equal(getLand(s, id).area, '1.65');
  assert.equal(getLand(s, id).region, 'tuscany');
  assert.equal(estateArea(s, 2).toFixed(2), '4.65');
  assert.equal(estateArea(s, 1), 3);
  assert.equal(s.plots.filter((p) => p.id === id).length, 1);
  valid(s);
});
