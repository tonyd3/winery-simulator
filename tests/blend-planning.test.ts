import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  deserialize,
  getLand,
  newGame,
  serialize,
  stateSchema,
} from '../src/game.ts';
import {
  allocateBlend,
  maximumBlendVolume,
  percentWeights,
  planBlend,
  recipePercentages,
  trialAvailability,
} from '../src/blendPlanning.ts';
import { blendProfile, DEFAULT_DESIGN, volume } from '../src/winemaking.ts';
import type { GameState } from '../src/game.ts';
import { learn } from './helpers.ts';

function cellar() {
  const s = newGame();
  s.week = 6;
  s.nextId = 4;
  s.reserves = ['merlot', 'cabernet', 'petit_verdot'].map((variety, i) => ({
    id: i + 1,
    name: variety,
    stored: 6,
    score: null,
    components: [
      {
        variety,
        estateId: 1,
        year: 1,
        ml: [120000, 60000, 20000][i],
        quality: [79, 84, 82][i],
        directCostCents: [12000, 9000, 7000][i],
        fermentation: 'steel',
        maturation: {
          version: 1,
          vessel: 'neutral',
          weeks: 4,
          oakDominant: false,
        },
      },
    ],
  }));
  assert.equal(stateSchema.safeParse(s).success, true);
  return s;
}
const recipe = [
  { id: 1, ml: 60000 },
  { id: 2, ml: 40000 },
];
const save = (s: GameState, name = 'Orchard trial', portions = recipe) =>
  act(s, { type: 'saveBlendTrial', name, portions });
const liquid = (s: GameState) =>
  s.reserves.reduce((sum, r) => sum + volume(r.components), 0);

test('percentage recipes conserve exact milliliters with deterministic fractional shares', () => {
  const s = cellar();
  const copy = structuredClone(s);
  const weights = percentWeights(['33.34', '33.33', '33.33']);
  const portions = allocateBlend(s.reserves, weights, 10001);
  assert.deepEqual(
    portions.map((p) => p.ml),
    [3335, 3333, 3333],
  );
  assert.equal(
    portions.reduce((n, p) => n + p.ml, 0),
    10001,
  );
  assert.deepEqual(recipePercentages(recipe), ['60', '40']);
  assert.deepEqual(
    recipePercentages(s.reserves.map((r) => ({ id: r.id, ml: 1 }))),
    ['33.34', '33.33', '33.33'],
  );
  assert.deepEqual(s, copy);
});

test('batch maximum respects the limiting source and allocations cannot overdraw stock', () => {
  const lots = cellar().reserves.slice(0, 2);
  const weights = percentWeights(['60', '40']);
  assert.equal(maximumBlendVolume(lots, weights), 150000);
  assert.deepEqual(allocateBlend(lots, weights, 150000), [
    { id: 1, ml: 90000 },
    { id: 2, ml: 60000 },
  ]);
  assert.throws(() => allocateBlend(lots, weights, 150002), /available volume/);
  for (const bad of [0, -1, 0.5, NaN, Infinity, 100000001])
    assert.throws(() => allocateBlend(lots, weights, bad), /batch size/);
  assert.throws(() => allocateBlend(lots, weights, 1), /available volume/);
  assert.throws(() => maximumBlendVolume(lots, [10000]), /valid percentage/);
});

test('percentage validation requires positive shares that sum to exactly 100', () => {
  for (const percentages of [
    ['60', '30'],
    ['0', '100'],
    ['', '100'],
    ['NaN', '100'],
    ['-1', '101'],
    ['33.333', '66.667'],
    ['100'],
  ])
    assert.throws(() => percentWeights(percentages));
  assert.deepEqual(percentWeights(['0.01', '99.99']), [1, 9999]);
});

test('planning preserves source provenance, costs, and source objects', () => {
  const s = cellar();
  const before = structuredClone(s);
  const plan = planBlend(s.reserves, recipe);
  assert.deepEqual(
    plan.components.map((p) => [p.variety, p.ml, p.directCostCents]),
    [
      ['merlot', 60000, 6000],
      ['cabernet', 40000, 6000],
    ],
  );
  assert.deepEqual(
    plan.components[0].maturation,
    s.reserves[0].components[0].maturation,
  );
  for (const invalid of [
    recipe.slice(0, 1),
    [recipe[0], recipe[0]],
    [{ id: 99, ml: 1 }, recipe[0]],
    [{ id: 1, ml: 120001 }, recipe[1]],
  ])
    assert.throws(() => planBlend(s.reserves, invalid));
  assert.deepEqual(s, before);
});

test('saving a trial uses no stock, money, kits, research, time, IDs, or RNG', () => {
  const before = cellar();
  const s = save(before, '  Orchard trial  ');
  assert.equal(s.blendTrials[0].name, 'Orchard trial');
  assert.deepEqual(s.blendTrials[0].portions, recipe);
  assert.deepEqual(
    s.blendTrials[0].components,
    planBlend(before.reserves, recipe).components,
  );
  for (const key of [
    'reserves',
    'cash',
    'kits',
    'research',
    'week',
    'nextId',
    'seed',
    'accounts',
  ] as const)
    assert.deepEqual(s[key], before[key], key);
  assert.deepEqual(before.blendTrials, []);
  assert.deepEqual(deserialize(serialize(s)), s);
  assert.throws(
    () => act(s, { type: 'blend', name: 'Orchard', portions: recipe }),
    /Research/,
  );
});

test('the notebook holds three trials, reuses removed slots, and rejects invalid actions immutably', () => {
  let s = save(save(save(cellar(), 'A'), 'B'), 'C');
  const before = structuredClone(s);
  assert.deepEqual(
    s.blendTrials.map((t) => t.slot),
    [0, 1, 2],
  );
  assert.throws(() => save(s, 'D'), /full/);
  assert.throws(
    () => act(s, { type: 'removeBlendTrial', slot: 99 }),
    /no longer/,
  );
  assert.deepEqual(s, before);
  s = act(s, { type: 'removeBlendTrial', slot: 1 });
  for (const name of ['', ' ', 'x'.repeat(41)])
    assert.throws(() => save(s, name), /Name/);
  assert.throws(() => save(s, 'Bad', [recipe[0], recipe[0]]), /different/);
  s = save(s, 'D');
  assert.deepEqual(
    s.blendTrials.map((t) => [t.slot, t.name]),
    [
      [0, 'A'],
      [2, 'C'],
      [1, 'D'],
    ],
  );
  assert.deepEqual(deserialize(serialize(s)), s);
  assert.equal(liquid(s), 200000);
});

test('saved trials survive depleted sources without restoring wine or bypassing production rules', () => {
  let s = save(cellar());
  const trial = structuredClone(s.blendTrials[0]);
  assert.equal(trialAvailability(s.reserves, trial), null);
  s = learn(s, 'oenology');
  s = act(s, { type: 'blend', name: trial.name, portions: trial.portions });
  assert.deepEqual(s.reserves.at(-1)!.components, trial.components);
  assert.deepEqual(
    blendProfile(s.reserves.at(-1)!.components),
    blendProfile(trial.components),
  );
  assert.equal(liquid(s), 200000);
  assert.match(
    trialAvailability(s.reserves, trial)!,
    /available volume from lot 2/,
  );
  s = act(s, {
    type: 'bottle',
    id: 4,
    bottles: 100,
    line: { name: 'Orchard', design: DEFAULT_DESIGN },
  });
  assert.equal(liquid(s) + volume(s.wines[0].components), 200000);
  assert.deepEqual(s.blendTrials[0], trial);
  assert.equal(
    s.reserves
      .flatMap((r) => r.components)
      .concat(s.wines.flatMap((w) => w.components))
      .reduce((sum, p) => sum + (p.directCostCents ?? 0), 0),
    28000,
  );
  assert.deepEqual(deserialize(serialize(s)), s);
  const emptySources = { ...s, reserves: [] };
  assert.match(trialAvailability(emptySources.reserves, trial)!, /no longer/);
  assert.deepEqual(deserialize(serialize(emptySources)), emptySources);
});

test('saved blend trials preserve parcel origins and reject invalid parcel references', () => {
  const s = cellar();
  const land = getLand(s, 1);
  const parcel = { id: land.id, name: land.name, soil: land.soil };
  s.reserves[0].components[0].parcel = parcel;
  const saved = deserialize(serialize(save(s)));
  assert.deepEqual(saved.blendTrials[0].components[0].parcel, parcel);

  // A trial keeps its recorded origins after the original reserves are used up.
  saved.reserves = [];
  assert.deepEqual(deserialize(serialize(saved)), saved);
  for (const id of [4, 25]) {
    const bad = structuredClone(saved);
    bad.blendTrials[0].components[0].parcel = { ...parcel, id };
    assert.equal(stateSchema.safeParse(bad).success, false);
  }
});

test('legacy saves default to an empty notebook and malformed trial snapshots are rejected', () => {
  const oldSave = structuredClone(cellar()) as Partial<GameState>;
  delete oldSave.blendTrials;
  assert.deepEqual(stateSchema.parse(oldSave).blendTrials, []);
  const s = save(cellar());
  const mutations: ((s: GameState) => void)[] = [
    (s) => {
      s.blendTrials.push(structuredClone(s.blendTrials[0]));
    },
    (s) => {
      s.blendTrials[0].created = s.week + 1;
    },
    (s) => {
      s.blendTrials[0].portions[0].id = s.nextId;
    },
    (s) => {
      s.blendTrials[0].portions[1].id = 1;
    },
    (s) => {
      s.blendTrials[0].portions[0].ml++;
    },
    (s) => {
      s.blendTrials[0].components[0].variety = 'imaginary';
    },
    (s) => {
      s.blendTrials[0].components[0].estateId = 8;
    },
    (s) => {
      s.blendTrials[0].components[0].quality = 101;
    },
    (s) => {
      s.blendTrials[0].components[0].year = 2;
    },
  ];
  for (const mutate of mutations) {
    const bad = structuredClone(s);
    mutate(bad);
    assert.equal(stateSchema.safeParse(bad).success, false);
  }
});
