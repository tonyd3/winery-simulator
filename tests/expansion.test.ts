import { learn } from './helpers.ts';
import { researchTerms } from '../src/researchProgression.ts';
import { bottleBatch } from './helpers.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  availableVarieties,
  calendar,
  deserialize,
  getLand,
  getVariety,
  newGame,
  plantingCost,
  REGIONS,
  REGION_IDS,
  RESEARCH,
  serialize,
  stateSchema,
  suitability,
  VARIETIES,
  weather,
} from '../src/game.ts';
import type { GameState, ResearchId, BreedingTrait } from '../src/game.ts';
const tick = (s: GameState, n = 1): GameState => {
  for (let i = 0; i < n; i++) s = act(s, { type: 'advance' });
  return s;
};
function research(s: GameState, id: ResearchId) {
  return tick(act(s, { type: 'research', id }), researchTerms(s, id).weeks);
}
function nursery() {
  let s = newGame('mosel');
  s.cash = 200000;
  s.knowledge = 500;
  s = research(research(research(s, 'ampelography'), 'heritage'), 'breeding');
  return research(s, 'grape_cabernet');
}
const crossing = (
  s: GameState,
  trait: BreedingTrait = 'climate',
  name = 'River No. 1',
) => act(s, { type: 'breed', parents: ['riesling', 'cabernet'], trait, name });

test('all eight regions start with local vines, distinct soils, and equal capital', () => {
  assert.equal(Object.keys(VARIETIES).length, 34);
  for (const id of REGION_IDS) {
    const s = newGame(id, 'Regional estate');
    assert.equal(s.cash, 12500);
    assert.equal(s.region, id);
    assert.equal(s.name, 'Regional estate');
    assert.deepEqual(
      s.plots.slice(0, 2).map((p) => p.variety),
      REGIONS[id].starters,
    );
    assert.ok(
      REGIONS[id].starters.every((v) =>
        availableVarieties(s).some(([g]) => g === v),
      ),
    );
    assert.equal(getLand(s, 1).soil, REGIONS[id].soils[0]);
    assert.ok(stateSchema.safeParse(s).success);
    let wine = act(s, { type: 'harvest', id: 1 });
    wine = act(wine, { type: 'ferment', id: wine.grapes[0].id, oak: false });
    wine = tick(wine, 2);
    wine = bottleBatch(wine, wine.batches[0].id);
    assert.ok(wine.wines[0].bottles > 0);
    assert.deepEqual(deserialize(serialize(wine)), wine);
  }
  assert.throws(() => newGame('unknown' as any), /region/);
  assert.throws(() => newGame('mosel', '  '), /name/);
});
test('imported grapes remain plantable; climate changes growth and quality, not access', () => {
  const cool = newGame('mosel'),
    warm = learn(newGame('barossa'), 'grape_pinot');
  assert.equal(suitability(cool, 'pinot').label, 'Excellent');
  assert.equal(suitability(warm, 'pinot').label, 'Challenging');
  const a = act(cool, { type: 'plant', id: 3, variety: 'pinot' }),
    b = act(warm, { type: 'plant', id: 3, variety: 'pinot' });
  assert.equal(b.plots[2].variety, 'pinot');
  assert.ok(tick(a).plots[2].growth > tick(b).plots[2].growth);
  assert.ok(
    suitability(cool, 'pinot').quality > suitability(warm, 'pinot').quality,
  );
  assert.equal(
    plantingCost(newGame(), 'merlot'),
    Math.round(VARIETIES.merlot.planting * 0.85),
  );
  assert.ok(weather(6, 'barossa').temp > weather(6, 'mosel').temp);
});
test('soil bonus is independent of region fit and grape finesse', () => {
  for (const id of REGION_IDS) {
    const s = newGame(id);
    for (const [v, g] of Object.entries(VARIETIES))
      assert.equal(
        suitability(s, v, g.preferred).quality -
          suitability(s, v, 'Other').quality,
        8,
      );
  }
});
test('research enforces prerequisites, cost, exclusivity and exact completion time', () => {
  const original = newGame();
  original.knowledge = 40;
  assert.throws(
    () => act(original, { type: 'research', id: 'breeding' }),
    /Requires/,
  );
  let s = act(original, { type: 'research', id: 'ampelography' });
  assert.equal(s.cash, 11300);
  assert.equal(s.knowledge, 0);
  assert.equal(original.knowledge, 40);
  assert.throws(() => act(s, { type: 'research', id: 'oenology' }), /slot/);
  assert.equal(tick(s, 5).research.length, 0);
  s = tick(s, 6);
  assert.deepEqual(s.research, ['ampelography']);
  assert.equal(s.knowledge, 36);
  assert.equal(tick(s).knowledge, 44);
  assert.throws(
    () => act(s, { type: 'research', id: 'ampelography' }),
    /Completed/,
  );
  assert.throws(
    () => act(s, { type: 'research', id: 'heritage' }),
    /knowledge/,
  );
});

test('knowledge rewards accompany production once, with no failed-action rewards', () => {
  let s = newGame();
  s = act(s, { type: 'harvest', id: 1 });
  assert.equal(s.knowledge, 42);
  assert.throws(() => act(s, { type: 'harvest', id: 1 }));
  assert.equal(s.knowledge, 42);
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: false });
  s = tick(s, 2);
  s = bottleBatch(s, s.batches[0].id);
  assert.equal(s.knowledge, 62);
});
test('individual grape studies unlock one grape and adaptation improves difficult grapes', () => {
  let s = newGame('barossa');
  s.cash = 300000;
  s.knowledge = 1000;
  assert.throws(
    () => act(s, { type: 'plant', id: 3, variety: 'nebbiolo' }),
    /Research/,
  );
  const before = suitability(s, 'pinot');
  for (const id of [
    'ampelography',
    'heritage',
    'adaptation',
    'discovery',
  ] as const)
    s = research(s, id);
  assert.ok(suitability(s, 'pinot').quality > before.quality);
  assert.equal(
    availableVarieties(s).length,
    2,
    'Technique research does not grant grape collections',
  );
  s = research(s, 'grape_nebbiolo');
  assert.equal(availableVarieties(s).length, 3);
  assert.ok(!availableVarieties(s).some(([id]) => id === 'riesling'));
  assert.equal(
    act(s, { type: 'plant', id: 3, variety: 'nebbiolo' }).plots[2].variety,
    'nebbiolo',
  );
});
test('breeding saves its outcome upfront, survives reload and completes once', () => {
  const ready = nursery(),
    s = crossing(ready);
  assert.equal(s.cash, ready.cash - 7500);
  assert.equal(s.knowledge, ready.knowledge - 160);
  assert.throws(() => crossing(s), /in progress/);
  assert.equal(tick(s, 23).hybrids.length, 0);
  const complete = tick(s, 24);
  assert.equal(complete.hybrids.length, 1);
  assert.equal(complete.breedingProject, null);
  assert.equal(tick(complete).hybrids.length, 1);
  assert.deepEqual(tick(deserialize(serialize(s)), 24), complete);
  assert.deepEqual(complete.hybrids[0].parents, ['riesling', 'cabernet']);
  assert.ok(
    suitability(complete, complete.hybrids[0].id).mismatch <
      suitability(complete, 'cabernet').mismatch,
  );
});
test('breeding traits trade yield, resilience, and finesse; field selection shortens new trials', () => {
  const s = nursery();
  const fineState = learn(structuredClone(s), 'genomics');
  const hardy = crossing(s, 'resilience').breedingProject!.result;
  const fine = crossing(fineState, 'finesse').breedingProject!.result;
  assert.ok(hardy.resilience > fine.resilience);
  assert.ok(fine.finesse > hardy.finesse);
  assert.ok(fine.yieldFactor < hardy.yieldFactor);
  const selected = learn(structuredClone(s), 'selection');
  assert.equal(crossing(selected).breedingProject!.remaining, 18);
  const control = structuredClone(s);
  control.week = 16;
  control.plots[0].variety = 'pinot';
  control.plots[0].health = 90;
  const improved = structuredClone(control);
  improved.research.push('selection');
  assert.equal(
    tick(improved).plots[0].health,
    tick(control).plots[0].health + 1,
  );
});
test('invalid breeding inputs cannot charge funds or mutate knowledge', () => {
  assert.throws(() => crossing(newGame()), /Cross-pollination/);
  const s = nursery(),
    snapshot = structuredClone(s);
  for (const action of [
    {
      type: 'breed',
      parents: ['riesling', 'riesling'],
      trait: 'climate',
      name: 'Same',
    },
    {
      type: 'breed',
      parents: ['riesling', 'nebbiolo'],
      trait: 'climate',
      name: 'Locked',
    },
    {
      type: 'breed',
      parents: ['riesling', 'cabernet'],
      trait: 'climate',
      name: ' ',
    },
    {
      type: 'breed',
      parents: ['riesling', 'cabernet'],
      trait: 'climate',
      name: 'Merlot',
    },
    {
      type: 'breed',
      parents: ['riesling', 'cabernet'],
      trait: 'bad',
      name: 'Bad',
    },
  ] as any[])
    assert.throws(() => act(s, action));
  assert.deepEqual(s, snapshot);
  s.knowledge = 0;
  assert.throws(() => crossing(s), /knowledge/);
  s.knowledge = 160;
  s.cash = 0;
  assert.throws(() => crossing(s), /more/);
});
test('custom grape completes the full estate loop and can be a parent again', () => {
  let s = tick(crossing(nursery()), 24),
    id = s.hybrids[0].id;
  s = act(s, { type: 'plant', id: 3, variety: id });
  for (let i = 0; i < 24 && s.plots[2].growth < 80; i++) s = tick(s);
  assert.notEqual(calendar(s.week).season, 'Winter');
  s = act(s, { type: 'harvest', id: 3 });
  assert.equal(s.grapes[0].variety, id);
  s = act(s, { type: 'ferment', id: s.grapes[0].id, oak: true });
  s = tick(s, 2);
  s = act(s, { type: 'age', id: s.batches[0].id });
  s = tick(s, 2);
  s = bottleBatch(s, s.batches[0].id);
  assert.equal(s.wines[0].variety, id);
  assert.ok(s.wines[0].label.includes('River No. 1'));
  s = act(s, { type: 'list', id: s.wines[0].id });
  s = tick(s);
  assert.ok(s.stats.sold > 0);
  assert.deepEqual(deserialize(serialize(s)), s);
  learn(s, 'backcrossing', 'grape_merlot');
  s = act(s, {
    type: 'breed',
    parents: [id, 'merlot'],
    trait: 'resilience',
    name: 'Second generation',
  });
  s = tick(s, 24);
  assert.equal(s.hybrids.length, 2);
  assert.equal(getVariety(s, 'cross-2').name, 'Second generation');
  assert.deepEqual(deserialize(serialize(s)), s);
});
test('replanting clears crops and costs money but cannot grant a second yearly harvest', () => {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  const year = s.plots[0].harvestedYear,
    cash = s.cash;
  s = act(s, { type: 'uproot', id: 1 });
  assert.equal(s.cash, cash - 120);
  assert.equal(s.plots[0].variety, null);
  learn(s, 'grape_pinot');
  s = act(s, { type: 'plant', id: 1, variety: 'pinot' });
  assert.equal(s.plots[0].harvestedYear, year);
  assert.equal(tick(s).plots[0].growth, 15);
  assert.throws(() => act(s, { type: 'harvest', id: 1 }));
});
test('v1 saves migrate all existing assets without a reset or reinterpreting soils', () => {
  let existing = newGame();
  existing.cellar.tanks.forEach((t) => {
    t.capacity = 400;
  });
  existing = act(existing, { type: 'harvest', id: 1 });
  existing = act(existing, {
    type: 'ferment',
    id: existing.grapes[0].id,
    oak: false,
  });
  existing.cash = 4321;
  existing.plots[1].variety = 'chardonnay';
  const {
    grapeLicenses,
    region,
    legacyLand,
    knowledge,
    research,
    researchProject,
    hybrids,
    breedingProject,
    nextHybrid,
    ...legacy
  } = existing;
  const migrated = deserialize(
    JSON.stringify({
      game: 'terroir',
      savedAt: 'legacy',
      state: { ...legacy, version: 1 },
    }),
  );
  const {
    grapeLicenses: licensed,
    region: r,
    legacyLand: l,
    knowledge: k,
    research: rs,
    researchProject: rp,
    hybrids: h,
    breedingProject: bp,
    nextHybrid: nh,
    ...rest
  } = migrated;
  assert.deepEqual(rest, { ...legacy, version: 6 });
  assert.equal(r, 'bordeaux');
  assert.equal(l, true);
  assert.equal(getLand(migrated, 3).soil, 'Chalk');
  assert.deepEqual(deserialize(serialize(migrated)), migrated);
});
test('save validation rejects unknown regions, impossible projects and broken custom lineage', () => {
  const valid = tick(crossing(nursery()), 24);
  for (const change of [
    (s: any) => (s.region = 'mars'),
    (s: any) => (s.research = ['breeding']),
    (s: any) => s.research.push('breeding'),
    (s: any) => (s.researchProject = { id: 'selection', remaining: 0 }),
    (s: any) => (s.hybrids[0].parents = ['cross-1', 'merlot']),
    (s: any) => s.hybrids.push({ ...s.hybrids[0] }),
    (s: any) => (s.hybrids[0].heat = 50),
    (s: any) => (s.hybrids[0].yieldFactor = 200),
    (s: any) => (s.plots[2].variety = 'cross-999'),
    (s: any) => (s.nextHybrid = 1),
  ]) {
    const bad = structuredClone(valid);
    change(bad);
    assert.throws(() => deserialize(serialize(bad)), /compatible/);
  }
});
